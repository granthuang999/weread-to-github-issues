/**
 * WeRead to GitHub Issues Sync Tool (Main Program)
 */

import dotenv from "dotenv";
import { parseArgs } from "./core/cli";
import { getBrowserCookie } from "./utils/cookie";
import { refreshSession, getBookshelfBooks, getNotebookBooks } from "./api/weread/services";
import { enhanceBookMetadata } from "./core/formatter";
import { syncBookToGithub } from "./core/sync/sync-to-github";

// Load environment variables from .env file
dotenv.config({ path: ".env" });

/**
 * Main function to execute the sync process based on command-line arguments
 */
async function main() {
  try {
    console.log("=== WeRead → GitHub Issues Sync Started ===");

    const { bookId, syncAll, fullSync } = parseArgs();
    let cookie = getBrowserCookie();
    console.log("Cookie loaded successfully.");

    cookie = await refreshSession(cookie);
    console.log("Session has been refreshed.");

    if (syncAll) {
      console.log("Fetching all books from bookshelf...");
      
      // 我们现在只从书架HTML获取，因为这是唯一可靠的数据源
      const shelfBooks = await getBookshelfBooks(cookie);
      
      const allBooks = await enhanceBookMetadata(cookie, shelfBooks, []);

      console.log(`Found ${allBooks.length} books in total. Starting sync for each...`);

      for (let i = 0; i < allBooks.length; i++) {
        const book = allBooks[i];
        console.log(`\n[${i + 1}/${allBooks.length}] Syncing book: 《${book.title}》...`);
        await syncBookToGithub(cookie, book);
        
        // 【关键修正】增加2秒延时，防止GitHub API速率限制
        console.log("Waiting for 2 seconds to avoid rate limiting...");
        await new Promise(resolve => setTimeout(resolve, 2000)); 
      }
    } else if (bookId) {
      const placeholderBook = { bookId, title: `Book with ID ${bookId}`, author: 'Unknown', cover: '' };
      await syncBookToGithub(cookie, placeholderBook);
    } else {
      console.log(
        "Please specify a book ID with --bookId=xxx or use --all to sync all books."
      );
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

