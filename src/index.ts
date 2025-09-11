/**
 * WeRead to Markdown Bookshelf Tool (Main Program)
 * This version only generates and prints the markdown.
 */

import dotenv from "dotenv";
import { getBrowserCookie } from "./utils/cookie";
import { refreshSession, getBookshelfBooks } from "./api/weread/services";
import { generateBookshelfMarkdown } from "./core/markdown-generator";

// Load environment variables from .env file
dotenv.config({ path: ".env" });

/**
 * Main function to execute the sync and generation process
 */
async function main() {
  try {
    console.log("=== WeRead Bookshelf to Markdown Generator Started ===");

    let cookie = getBrowserCookie();
    console.log("Cookie loaded successfully.");

    cookie = await refreshSession(cookie);
    console.log("Session has been refreshed.");

    // 1. 获取书架上的所有书籍
    const allBooks = await getBookshelfBooks(cookie);

    if (allBooks && allBooks.length > 0) {
      // 2. 如果成功获取到书籍，则生成 Markdown 内容
      const markdownContent = generateBookshelfMarkdown(allBooks);
      
      // 3. 【关键修正】将完整的 Markdown 内容打印出来
      // 我们用特殊标记包裹它，方便工作流的下一步捕捉
      console.log("---START_BOOKSHELF_MARKDOWN---");
      console.log(markdownContent);
      console.log("---END_BOOKSHELF_MARKDOWN---");

    } else {
      console.log("未能获取到任何书籍，跳过生成步骤。");
    }

    console.log("\n=== Markdown Generation finished. ===");
  } catch (error: any) {
    console.error("An error occurred during the process:", error.message);
  }
}

// Run the main function
main().catch((error) => {
  console.error("Program execution failed:", error);
});

