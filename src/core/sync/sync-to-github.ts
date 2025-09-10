/**
 * Core sync logic for a single book to GitHub Issues.
 */
import { getBookHighlightsFormatted, getBookThoughtsFormatted } from "../formatter";
import { findIssueByBookId, createNewIssueForBook, updateIssueBody, getIssueBody } from "../../api/github/services";
import { Book, FormattedThought, FormattedChapter } from "../../config/types";
import { getBookInfo } from "../../api/weread/services";

/**
 * Formats new notes (highlights and thoughts) into a markdown string.
 */
function formatNotesToMarkdown(chapters: FormattedChapter[], thoughts: FormattedThought[]): string {
  let markdownContent = '';

  // Process highlights chapter by chapter
  chapters.forEach(chapter => {
    // Only add chapter title if there are highlights in it
    if(chapter.highlights && chapter.highlights.length > 0) {
      markdownContent += `### ${chapter.chapterTitle}\n\n`;
      chapter.highlights.forEach(highlight => {
        // Use bookmarkId if available, otherwise construct a fallback from range
        const bookmarkId = highlight.bookmarkId || `range-${highlight.range}`;
        markdownContent += `> ${highlight.text.replace(/\n/g, '\n> ')}\n`;
        // Add a hidden HTML comment to track synced highlights
        markdownContent += `<!-- highlightId: ${bookmarkId} -->\n\n`;
      });
    }
  });

  // Process thoughts if any
  if (thoughts.length > 0) {
    markdownContent += `## 随想笔记\n\n---\n\n`;
    thoughts.forEach(thought => {
      // If the thought is a comment on a specific highlight
      if (thought.abstract) {
        markdownContent += `> ${thought.abstract.replace(/\n/g, '\n> ')}\n\n`;
      }
      // The thought content itself
      markdownContent += `**[随想]**: ${thought.content}\n`;
      markdownContent += `*—— 记于 ${thought.createdTime}*\n`;
       // Add a hidden HTML comment to track synced thoughts
      markdownContent += `<!-- thoughtId: ${thought.reviewId} -->\n\n---\n\n`;
    });
  }

  return markdownContent;
}

/**
 * Parses an issue body to extract IDs of already synced highlights and thoughts.
 */
function parseSyncedBookmarkIds(body: string): Set<string> {
  const syncedIds = new Set<string>();
  // Regex to find <!-- highlightId: xxx --> or <!-- thoughtId: yyy -->
  const regex = /<!--\s*(?:highlightId|thoughtId):\s*([^ ]+?)\s*-->/g;
  let match;
  while ((match = regex.exec(body)) !== null) {
    syncedIds.add(match[1]);
  }
  return syncedIds;
}

/**
 * Main function to sync a single book to a GitHub Issue.
 * It's "upsert" logic: update if exists, insert if not.
 */
export async function syncBookToGithub(cookie: string, book: Book): Promise<void> {
  try {
    console.log(`\n🚀 Starting sync for: 《${book.title}》`);

    // 1. Find or create the issue for the book
    let issueNumber = await findIssueByBookId(book.bookId);
    if (!issueNumber) {
      // If book details are minimal from the shelf, fetch more complete ones before creating
      const detailedBookInfo = await getBookInfo(cookie, book.bookId);
      const bookToCreate = { ...book, ...detailedBookInfo };
      issueNumber = await createNewIssueForBook(bookToCreate);
    }

    if (!issueNumber) {
      console.error(`Failed to find or create an issue for 《${book.title}》. Skipping.`);
      return;
    }

    // 2. Get the current body of the issue
    const currentBody = await getIssueBody(issueNumber);
    if (currentBody === null) {
      console.error(`Failed to fetch issue body for #${issueNumber}. Skipping.`);
      return;
    }

    // 3. Parse the body to see what's already synced
    const syncedIds = parseSyncedBookmarkIds(currentBody);
    console.log(`Found ${syncedIds.size} already synced notes in Issue #${issueNumber}.`);

    // 4. Fetch ALL highlights and thoughts from WeRead (we need all to compare against syncedIds)
    // We pass `false` for `useIncremental` to always get the full list from WeRead
    const { highlights: allChapters } = await getBookHighlightsFormatted(cookie, book.bookId, false);
    const { thoughts: allThoughts } = await getBookThoughtsFormatted(cookie, book.bookId, false);

    // 5. Filter for only NEW highlights and thoughts
    const newChapters: FormattedChapter[] = allChapters.map(chapter => ({
      ...chapter,
      highlights: chapter.highlights.filter(h => !syncedIds.has(h.bookmarkId || `range-${h.range}`))
    })).filter(chapter => chapter.highlights.length > 0);

    const newThoughts = allThoughts.filter(t => t.reviewId && !syncedIds.has(t.reviewId));

    if (newChapters.length === 0 && newThoughts.length === 0) {
      console.log(`✅ No new notes found for 《${book.title}》. Sync complete.`);
      return;
    }
    
    const newHighlightsCount = newChapters.reduce((sum, ch) => sum + ch.highlights.length, 0);
    console.log(`Found ${newHighlightsCount} new highlights and ${newThoughts.length} new thoughts.`);

    // 6. Format new notes into markdown
    const newMarkdown = formatNotesToMarkdown(newChapters, newThoughts);

    // 7. Append new markdown to the existing body and update the issue
    const newBody = currentBody.trim() + '\n\n' + newMarkdown;
    await updateIssueBody(issueNumber, newBody);

    console.log(`✅ Successfully synced new notes to Issue #${issueNumber} for 《${book.title}》.`);

  } catch (error: any) {
    console.error(`An error occurred during sync for 《${book.title}》:`, error.message);
  }
}

