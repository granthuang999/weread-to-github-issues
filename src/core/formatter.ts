/**
 * 数据格式化处理模块
 */

import { HighlightsResponse, ThoughtsResponse } from "../config/types";
import { WeReadClient } from "../api/weread/client";
// 移除了 getBookProgress 的导入

/**
 * 获取并格式化书籍的划线数据
 */
export async function getBookHighlightsFormatted(
  cookie: string,
  bookId: string,
  useIncremental: boolean = true
): Promise<HighlightsResponse> {
  console.log(`\n获取书籍(ID: ${bookId})的划线数据...`);
  const wereadClient = new WeReadClient(cookie);
  return await wereadClient.getHighlights(bookId, useIncremental);
}

/**
 * 获取并格式化书籍的想法数据
 */
export async function getBookThoughtsFormatted(
  cookie: string,
  bookId: string,
  useIncremental: boolean = true
): Promise<ThoughtsResponse> {
  console.log(`\n获取书籍(ID: ${bookId})的想法数据...`);
  const wereadClient = new WeReadClient(cookie);
  return await wereadClient.getThoughts(bookId, useIncremental);
}

/**
 * 增强书籍元数据 (最终修正版)
 * 移除了获取阅读进度的逻辑
 */
export async function enhanceBookMetadata(
  cookie: string,
  shelfBooks: any[],
  notebookBooks: any[]
): Promise<any[]> {
  const bookMap = new Map();

  // 首先处理书架书籍
  for (const book of shelfBooks) {
    bookMap.set(book.bookId, {
      ...book,
      // 设置默认状态
      finishReadingStatus: book.finishReading ? "✅已读" : "📖在读", 
    });
  }

  // 合并有笔记的书籍信息（如果需要的话，但这步现在可以简化）
  for (const nbBook of notebookBooks) {
    const bookId = nbBook.bookId;
    if (bookMap.has(bookId)) {
      const existingBook = bookMap.get(bookId);
      bookMap.set(bookId, {
        ...existingBook,
        ...nbBook.book,
        hasHighlights: true,
      });
    } else {
      bookMap.set(bookId, {
        ...nbBook.book,
        bookId: nbBook.bookId,
        hasHighlights: true,
        finishReadingStatus: "📖在读",
      });
    }
  }
  
  const mergedBooks = Array.from(bookMap.values());
  console.log(`初步合并后共有 ${mergedBooks.length} 本书`);
  
  // 阅读进度获取逻辑已移除
  console.log("阅读进度API已失效，跳过获取进度步骤。");

  return mergedBooks;
}
