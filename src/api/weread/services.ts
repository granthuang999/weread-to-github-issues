/**
 * 微信读书API服务模块 (最终决定版修正)
 */

import axios from "axios";
import {
  WEREAD_BASE_URL,
  NOTEBOOK_API,
  BOOKMARKS_API,
  BOOKSHELF_URL,
  BOOK_INFO_URL,
  BOOK_PROGRESS_API,
  BOOK_THOUGHTS_API,
} from "../../config/constants";
// 关键修正：导入 getNotebookHeaders
import { getHeaders, getHighlightHeaders, getNotebookHeaders } from "../../utils/http";
import { updateCookieFromResponse } from "../../utils/cookie";
import {
  RawHighlightsData,
  RawThoughtsData,
} from "./models";
import { getBookProgress } from "./book-progress";

// 重新导出getBookProgress函数
export { getBookProgress };

/**
 * 刷新微信读书会话 (恢复到原始版本)
 */
export async function refreshSession(currentCookie: string): Promise<string> {
  console.log("正在刷新微信读书会话...");

  const urlsToVisit = [
    `${WEREAD_BASE_URL}/`, // 首页
    `${WEREAD_BASE_URL}/web/shelf`, // 书架页
  ];

  let updatedCookie = currentCookie;

  for (const url of urlsToVisit) {
    try {
      console.log(`访问: ${url} 以刷新会话...`);
      const headers = { ...getHeaders(updatedCookie), Referer: WEREAD_BASE_URL };
      const response = await axios.get(url, { headers, maxRedirects: 5, });

      if (response.headers["set-cookie"]) {
        updatedCookie = updateCookieFromResponse(updatedCookie, response.headers["set-cookie"]);
      }
    } catch (error: any) {
      console.warn(`刷新会话页面 ${url} 时遇到问题: ${error.message}.`);
    }
  }
  console.log("会话刷新完成。");
  return updatedCookie;
}

/**
 * 从微信读书笔记本获取书籍列表 (最终修正版)
 * 采用您提供的正确逻辑
 */
export async function getNotebookBooks(cookie: string): Promise<any[]> {
  console.log("\n=== 从微信读书笔记本获取书籍列表 ===");
  try {
    // 关键修正：使用专用的 getNotebookHeaders
    const headers = getNotebookHeaders(cookie);
    const response = await axios.get(NOTEBOOK_API, { headers });
    
    // 关键修正：兼容 books 和 notebooks 两种返回结构
    if (response.data && (response.data.books || response.data.notebooks)) {
      const list = response.data.books || response.data.notebooks;
      console.log(`笔记本中共有 ${list.length} 本书`);
      // 笔记本API返回的数据包含book实体，需要解构
      return list.map((item: any) => item.book || item);
    } else {
       console.log("笔记本API响应正常，但没有书籍数据。");
       return [];
    }
  } catch (error: any) {
    console.error("获取笔记本列表失败:", error.message);
    if (error.response && error.response.status === 401) {
       console.error("错误详情: 身份验证失败(401)，请确认 Cookie 或 headers。");
    }
    return [];
  }
}

/**
 * 从微信读书书架获取书籍列表 (恢复到原始版本)
 */
export async function getBookshelfBooks(cookie: string): Promise<any[]> {
  console.log("\n=== 从微信读书书架获取书籍列表 ===");
  try {
    const headers = getHeaders(cookie);
    const response = await axios.get(BOOKSHELF_URL, { headers });

    if (response.data && response.data.books) {
      console.log(`书架中共有 ${response.data.books.length} 本书`);
      return response.data.books;
    } else {
       console.log("书架API响应正常，但没有书籍数据。");
       return [];
    }
  } catch (error: any) {
    console.error("获取书架列表失败:", error.message);
    return [];
  }
}

/**
 * 获取书籍的详细信息
 */
export async function getBookInfo(
  cookie: string,
  bookId: string
): Promise<any> {
  const url = `${BOOK_INFO_URL}?bookId=${bookId}`;
  try {
    const headers = getHeaders(cookie);
    const response = await axios.get(url, { headers });
    return response.data;
  } catch (error: any) {
    console.error(`获取书籍 ${bookId} 信息失败:`, error.message);
    return null;
  }
}

/**
 * 获取书籍的划线数据
 */
export async function getBookHighlights(
  cookie: string,
  bookId: string,
  synckey: string = "0"
): Promise<RawHighlightsData | null> {
  const url = `${BOOKMARKS_API}?bookId=${bookId}&synckey=${synckey}`;
  try {
    const headers = getHighlightHeaders(cookie, bookId);
    const response = await axios.get(url, { headers });
    return response.data;
  } catch (error: any) {
    console.error(`获取书籍 ${bookId} 划线失败:`, error.message);
    return null;
  }
}

/**
 * 获取书籍的想法数据
 */
export async function getBookThoughts(
  cookie: string,
  bookId: string,
  synckey: string = "0"
): Promise<RawHighlightsData | null> {
  const url = `${BOOK_THOUGHTS_API}?bookId=${bookId}&listType=11&mine=1&synckey=${synckey}`;
  try {
    const headers = getHighlightHeaders(cookie, bookId);
    const response = await axios.get(url, { headers });
    return response.data;
  } catch (error: any) {
    console.error(`获取书籍 ${bookId} 想法失败:`, error.message);
    return null;
  }
}

