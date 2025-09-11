/**
 * 核心同步逻辑 (简化版)
 * 只负责创建Issue，不再同步划线和想法
 */
import { Book } from "../../config/types";
import { createNewIssueForBook } from "../../api/github/services";

/**
 * 【全新逻辑】同步单本书到GitHub Issues
 * 这个函数现在只检查Issue是否存在，如果不存在则创建。
 * @param book The book object from WeRead.
 * @param issuesMap A map of all existing book issues in the repo.
 */
export async function syncBookToGithub(
  book: Book,
  issuesMap: Map<string, any>
): Promise<void> {
  console.log(`🚀 Starting sync for: 《${book.title}》`);

  try {
    // 检查Map中是否已存在此书的Issue
    if (issuesMap.has(book.bookId)) {
      const existingIssue = issuesMap.get(book.bookId);
      console.log(`Found existing issue #${existingIssue.number} for bookId: ${book.bookId}. Skipping creation.`);
      return;
    }

    // 如果不存在，则创建一个新的Issue
    console.log(`No existing issue found for bookId: ${book.bookId}. Creating a new one...`);
    await createNewIssueForBook(book);

  } catch (error: any) {
    console.error(`An error occurred while syncing book "${book.title}":`, error.message);
  }
}

