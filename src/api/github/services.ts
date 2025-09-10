/**
 * GitHub API Service
 * Encapsulates all interactions with the GitHub API.
 */
import { Octokit } from "@octokit/rest";
import { Book } from "../../config/types"; // Assuming types are defined here

// Initialize Octokit
const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN,
});

const owner = process.env.GITHUB_REPO_OWNER!;
const repo = process.env.GITHUB_REPO_NAME!;

/**
 * Finds an issue by searching for a unique bookId marker in its body.
 * @param bookId The unique ID of the book.
 * @returns The issue number if found, otherwise null.
 */
export async function findIssueByBookId(bookId: string): Promise<number | null> {
  const marker = `<!-- bookId: ${bookId} -->`;
  const query = `repo:${owner}/${repo} is:issue in:body "${marker}"`;

  try {
    const { data } = await octokit.search.issuesAndPullRequests({ q: query });
    if (data.items.length > 0) {
      console.log(`Found existing issue #${data.items[0].number} for bookId: ${bookId}`);
      return data.items[0].number;
    }
    return null;
  } catch (error: any) {
    console.error(`Error searching for issue with bookId ${bookId}:`, error.message);
    return null;
  }
}

/**
 * Creates a new issue for a book.
 * @param book The book object containing metadata.
 * @returns The newly created issue number, or null on failure.
 */
export async function createNewIssueForBook(book: Book): Promise<number | null> {
  const marker = `<!-- bookId: ${book.bookId} -->`;
  const title = `📚 《${book.title}》`;
  const body = `
![封面](${book.cover})

### 《${book.title}》
- **作者**: ${book.author}
- **分类**: ${book.category}
- **阅读状态**: ${book.finishReadingStatus || '未知'}

---
## 读书笔记

${marker}
  `;

  try {
    const { data } = await octokit.issues.create({
      owner,
      repo,
      title,
      body,
      labels: ['weread', 'reading-notes'], // Optional labels
    });
    console.log(`Successfully created new issue #${data.number} for book: ${book.title}`);
    return data.number;
  } catch (error: any) {
    console.error(`Error creating issue for book "${book.title}":`, error.message);
    return null;
  }
}

/**
 * Updates the body of an existing issue.
 * @param issueNumber The number of the issue to update.
 * @param newBody The full new content for the issue body.
 */
export async function updateIssueBody(issueNumber: number, newBody: string): Promise<boolean> {
  try {
    await octokit.issues.update({
      owner,
      repo,
      issue_number: issueNumber,
      body: newBody,
    });
    console.log(`Successfully updated issue #${issueNumber}.`);
    return true;
  } catch (error: any) {
    console.error(`Error updating issue #${issueNumber}:`, error.message);
    return false;
  }
}

/**
 * Fetches the body of a specific issue.
 * @param issueNumber The number of the issue.
 * @returns The issue body as a string, or null on failure.
 */
export async function getIssueBody(issueNumber: number): Promise<string | null> {
    try {
        const { data } = await octokit.issues.get({
            owner,
            repo,
            issue_number: issueNumber,
        });
        return data.body || '';
    } catch (error: any) {
        console.error(`Error fetching body for issue #${issueNumber}:`, error.message);
        return null;
    }
}

