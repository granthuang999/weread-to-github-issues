/**
 * WeRead to HTML Bookshelf Tool (Main Program)
 */

import dotenv from "dotenv";
import { getBrowserCookie } from "./utils/cookie";
import { refreshSession, getBookshelfBooks } from "./api/weread/services";
import { generateBookshelfHtml, writeHtmlToFile } from "./core/html-generator";

// Load environment variables from .env file
dotenv.config({ path: ".env" });

/**
 * Main function to execute the sync and generation process
 */
async function main() {
  try {
    console.log("=== WeRead Bookshelf HTML Generator Started ===");

    let cookie = getBrowserCookie();
    console.log("Cookie loaded successfully.");

    cookie = await refreshSession(cookie);
    console.log("Session has been refreshed.");

    // 1. 获取书架上的所有书籍
    const allBooks = await getBookshelfBooks(cookie);

    if (allBooks && allBooks.length > 0) {
      // 2. 如果成功获取到书籍，则生成HTML
      const htmlContent = generateBookshelfHtml(allBooks);
      
      // 3. 将HTML写入文件
      writeHtmlToFile(htmlContent, "book.html");
    } else {
      console.log("未能获取到任何书籍，跳过HTML生成。");
    }

    console.log("\n=== Process finished. ===");
  } catch (error: any) {
    console.error("An error occurred during the process:", error.message);
  }
}

// Run the main function
main().catch((error) => {
  console.error("Program execution failed:", error);
});

