/**
 * WeRead to GitHub Issues Sync Tool (Main Program)
 */

import dotenv from "dotenv";
import { parseArgs } from "./core/cli";
import { getBrowserCookie } from "./utils/cookie";
import { refreshSession, getBookshelfBooks } from "./api/weread/services";
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

    // We don't need to validate GitHub env vars here,
    // as they are read directly by the GitHub service module.
    
    // Parse command-line arguments
    const { bookId, syncAll, fullSync } = parseArgs();

    // Get WeRead Cookie
    let cookie = getBrowserCookie();
    console.log("Cookie loaded successfully.");

    // Refresh session to ensure the cookie is valid
    cookie = await refreshSession(cookie);
    console.log("Session has been refreshed.");

    if (syncAll) {
      // Sync all books
      console.log("Fetching all books from bookshelf and notebooks...");
      
      // New Strategy: Only rely on the bookshelf as the single source of truth
      const shelfBooks = await getBookshelfBooks(cookie);
      
      // The enhanceBookMetadata function is still useful for adding reading progress info
      const allBooks = await enhanceBookMetadata(cookie, shelfBooks, []);

      console.log(`Found ${allBooks.length} books in total. Starting sync for each...`);

      for (let i = 0; i < allBooks.length; i++) {
        const book = allBooks[i];
        console.log(`\n[${i + 1}/${allBooks.length}] Syncing book: 《${book.title}》...`);
        await syncBookToGithub(cookie, book, !fullSync);
      }
    } else if (bookId) {
      // Sync a single book
      // For single book sync, we need a placeholder Book object
      // The full details will be fetched inside the sync function
      const placeholderBook = { bookId, title: `Book with ID ${bookId}`, author: 'Unknown', cover: '' };
      await syncBookToGithub(cookie, placeholderBook, !fullSync);
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

