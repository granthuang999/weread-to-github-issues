/**
 * WeRead to GitHub Issues Sync Tool (Main Program)
 */

import dotenv from "dotenv";
import { parseArgs } from "./core/cli";
import { getBrowserCookie } from "./utils/cookie";
import { refreshSession, getBookshelfBooks } from "./api/weread/services";
import { syncBookToGithub } from "./core/sync/sync-to-github";
import { getAllBookIssuesMap } from "../../api/github/services";

// Load environment variables from .env file
dotenv.config({ path: ".env" });

/**
 * Main function to execute the sync process
 */
async function main() {
  try {
    console.log("=== WeRead → GitHub Issues Sync Started ===");

    const { syncAll } = parseArgs();

    if (!syncAll) {
        console.log("This script currently only supports --all mode.");
        return;
    }

    let cookie = getBrowserCookie();
    console.log("Cookie loaded successfully.");

    cookie = await refreshSession(cookie);
    console.log("Session has been refreshed.");

    // --- 新的、更高效的流程 ---

    // 1. 一次性获取所有已存在的Issues
    const issuesMap = await getAllBookIssuesMap();

    // 2. 获取书架上的所有书籍
    const allBooks = await getBookshelfBooks(cookie);

    console.log(`Found ${allBooks.length} books on your shelf. Comparing with ${issuesMap.size} existing issues...`);

    // 3. 循环处理每一本书
    for (let i = 0; i < allBooks.length; i++) {
      const book = allBooks[i];
      console.log(`\n[${i + 1}/${allBooks.length}] Processing book: 《${book.title}》...`);
      // 将书籍和已存在的Issues Map传递给同步函数
      await syncBookToGithub(book, issuesMap);
    }

    console.log("\n=== Sync process finished. ===");
  } catch (error: any) {
    console.error("An error occurred during the sync process:", error.message);
  }
}

// Run the main function
main().catch((error) => {
  console.error("Program execution failed:", error);
});

