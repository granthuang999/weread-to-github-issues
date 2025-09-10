/**
 * WeRead to GitHub Issues Sync Tool - Main Entry Point
 */
import dotenv from "dotenv";
import { parseArgs } from "./core/cli";
import { getBrowserCookie } from "./utils/cookie";
import { refreshSession, getBookshelfBooks, getNotebookBooks } from "./api/weread/services";
import { enhanceBookMetadata } from "./core/formatter";
import { syncBookToGithub } from "./core/sync/sync-to-github";

// Load environment variables from .env file
dotenv.config();

/**
 * Main function to execute the sync process based on CLI arguments.
 */
async function main() {
  try {
    console.log("=== WeRead → GitHub Issues Sync Started ===");

    // Validate essential environment variables for GitHub
    if (!process.env.GITHUB_TOKEN || !process.env.GITHUB_REPO_OWNER || !process.env.GITHUB_REPO_NAME) {
      console.error("Error: Missing required GitHub environment variables (GITHUB_TOKEN, GITHUB_REPO_OWNER, GITHUB_REPO_NAME).");
      return;
    }

    // Parse command-line arguments
    const { bookId, syncAll } = parseArgs();

    // Get and refresh WeRead cookie/session
    let cookie = getBrowserCookie();
    console.log("Cookie loaded successfully.");
    cookie = await refreshSession(cookie);
    console.log("Session has been refreshed.");

    if (syncAll) {
      // Sync all books
      console.log("Fetching all books from bookshelf and notebooks...");
      const shelfBooks = await getBookshelfBooks(cookie);
      const notebookBooks = await getNotebookBooks(cookie);
      const allBooks = await enhanceBookMetadata(cookie, shelfBooks, notebookBooks);
      
      console.log(`Found ${allBooks.length} books in total. Starting sync for each...`);
      for (const book of allBooks) {
        await syncBookToGithub(cookie, book);
        // Add a small delay to avoid hitting API rate limits, especially for a large library
        await new Promise(resolve => setTimeout(resolve, 1500)); 
      }
    } else if (bookId) {
      // Sync a single book
      // We only have the ID, so we create a minimal book object to pass to the sync function
      const book = { bookId, title: `Book with ID: ${bookId}` };
      await syncBookToGithub(cookie, book as any);
    } else {
      console.log("Usage: Use --all to sync all books, or --bookId=<ID> to sync a single book.");
      console.log("This script is typically run with --all in an automated environment.");
    }

    console.log("\n=== Sync process finished. ===");
  } catch (error: any) {
    console.error("An error occurred during the main process:", error.message);
  }
}

// Run the main function
main().catch((error) => {
  console.error("Fatal error executing the program:", error);
});

