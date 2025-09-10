/**
 * 微信读书API服务模块 (最终修正版)
 */

import axios from "axios";
import {
  WEREAD_API_URL,
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
 * 刷新微信读书会话 (最终修正版)
 * 核心修正：直接访问 i.weread.qq.com 的一个端点来激活数据接口的会话
 */
export async function refreshSession(currentCookie: string): Promise<string> {
  console.log("正在刷新微信读书会话...");
  // 访问一个真实的数据API端点以确保会话在 i.weread.qq.com 域上是活跃的
  const refreshUrl = NOTEBOOK_API; 
  let updatedCookie = currentCookie;

  try {
    console.log(`访问: ${refreshUrl} 以刷新会话...`);
    const headers = getHeaders(updatedCookie);
    const response = await axios.get(refreshUrl, { headers, maxRedirects: 5 });

    // 检查响应头中是否有新的Cookie
    if (response.headers["set-cookie"]) {
      console.log("服务端返回了新的Cookie，正在更新...");
      updatedCookie = updateCookieFromResponse(updatedCookie, response.headers["set-cookie"]);
    }
    console.log("会话刷新尝试成功。");

  } catch (error: any) {
    // 如果刷新失败（例如因为旧cookie完全无效），我们不在此处抛出错误。
    // 真正的错误会在后续的API调用中被捕获。
    // 这样做可以避免在cookie依然有效但刷新逻辑本身出问题时中断程序。
    console.warn(`刷新会话时遇到问题: ${error.message}. 将继续尝试使用现有Cookie.`);
  }

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

    // 笔记本API返回的数据结构是 { books: [...] }
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
    // 无论何种错误，都返回空数组让主流程继续
    return [];
  }
}

/**
 * 从微信读书书架获取书籍列表
 */
export async function getBookshelfBooks(cookie: string): Promise<any[]> {
  console.log("\n=== 从微信读书书架获取书籍列表 ===");
  try {
    const headers = getHeaders(cookie);
    // 书架API需要POST请求
    const response = await axios.post(BOOKSHELF_URL, { "synckey": 0, "bookIds": [] }, { headers });

    // 书架API返回的数据结构是 { "updates": [...] }
    if (response.data && response.data.updates) {
       // 过滤掉已删除或非书籍类型的数据
      const books = response.data.updates.filter((item: any) => item.book);
      console.log(`书架同步完成，发现 ${books.length} 本书。`);
      // 返回 book 对象数组
      return books.map((item: any) => item.book);
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
