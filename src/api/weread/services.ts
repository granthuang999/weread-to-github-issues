/**
 * 微信读书API服务模块 (最终修正版)
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
import { getHeaders, getHighlightHeaders } from "../../utils/http";
import { updateCookieFromResponse } from "../../utils/cookie";
import {
  RawHighlightsData,
  RawThoughtsData,
} from "./models";
import { getBookProgress } from "./book-progress";

// 重新导出getBookProgress函数
export { getBookProgress };

/**
 * 刷新微信读书会话 (恢复为原始项目的稳定逻辑)
 */
export async function refreshSession(currentCookie: string): Promise<string> {
  console.log("正在刷新微信读书会话...");
  const urlsToVisit = [
    `${WEREAD_BASE_URL}/`,
    `${WEREAD_BASE_URL}/web/shelf`,
  ];
  let updatedCookie = currentCookie;

  for (const url of urlsToVisit) {
    try {
      console.log(`访问: ${url} 以刷新会话...`);
      const headers = getHeaders(updatedCookie);
      const response = await axios.get(url, { headers, maxRedirects: 5 });
      if (response.headers["set-cookie"]) {
        console.log("服务端返回了新的Cookie，正在更新...");
        updatedCookie = updateCookieFromResponse(updatedCookie, response.headers["set-cookie"]);
      }
    } catch (error: any) {
      console.warn(`刷新会话时访问 ${url} 遇到问题: ${error.message}.`);
    }
  }
  console.log("会话刷新完成。");
  return updatedCookie;
}


/**
 * 从微信读书笔记本获取书籍列表
 */
export async function getNotebookBooks(cookie: string): Promise<any[]> {
  console.log("\n=== 从微信读书笔记本获取书籍列表 ===");
  try {
    const headers = getHeaders(cookie);
    const response = await axios.get(NOTEBOOK_API, { headers });

    if (response.data && response.data.books) {
      console.log(`笔记本中共有 ${response.data.books.length} 本书`);
      return response.data.books;
    } else {
       console.log("笔记本API响应正常，但没有书籍数据。");
       return [];
    }
  } catch (error: any) {
    console.error("获取笔记本列表失败:", error.message);
    if (error.response && error.response.status === 401) {
       console.error("错误详情: 身份验证失败(401)，请务必更新您的WEREAD_COOKIE。");
    }
    return [];
  }
}

/**
 * 从微信读书书架获取书籍列表 (恢复为原始项目的稳定逻辑)
 */
export async function getBookshelfBooks(cookie: string): Promise<any[]> {
  console.log("\n=== 从微信读书书架获取书籍列表 ===");
  try {
    const headers = getHeaders(cookie);
    // 关键修正：恢复为原始项目的 GET 请求
    const response = await axios.get(BOOKSHELF_URL, { headers });
    // 关键修正：原始API返回的数据在 "books" 字段中
    if (response.data && response.data.books) {
      console.log(`书架同步完成，发现 ${response.data.books.length} 本书。`);
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
): Promise<RawThoughtsData | null> {
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

