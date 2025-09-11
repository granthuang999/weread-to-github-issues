/**
 * 微信读书API服务模块 (最终策略版)
 */

import axios from "axios";
import {
  WEREAD_BASE_URL,
  NOTEBOOK_API, // Note: This will no longer be used for getting the book list
  BOOKMARKS_API,
  BOOKSHELF_URL,
  BOOK_INFO_URL,
  BOOK_PROGRESS_API,
  BOOK_THOUGHTS_API,
} from "../../config/constants";
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
 * 刷新微信读书会话
 */
export async function refreshSession(currentCookie: string): Promise<string> {
  console.log("正在刷新微信读书会话...");

  const urlsToVisit = [
    `${WEREAD_BASE_URL}/`, 
    BOOKSHELF_URL,
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
 * 【已移除】不再使用此函数获取书籍列表
 */
export async function getNotebookBooks(cookie: string): Promise<any[]> {
    console.log("`getNotebookBooks` 已被弃用，将返回空数组。");
    return [];
}

/**
 * 从微信读书书架获取书籍列表 (全新逻辑 - 从HTML解析)
 */
export async function getBookshelfBooks(cookie:string): Promise<any[]> {
    console.log("\n=== 从微信读书书架获取书籍列表 (HTML解析模式) ===");
    try {
        const headers = getHeaders(cookie);
        const response = await axios.get(BOOKSHELF_URL, { headers });

        // 确认返回的是HTML
        if (typeof response.data !== 'string' || !response.data.includes('<html')) {
            console.error("书架API未返回HTML页面，返回内容:", response.data);
            return [];
        }

        // 使用正则表达式从HTML中提取__INITIAL_STATE__
        const match = response.data.match(/window\.__INITIAL_STATE__\s*=\s*({.*?});/);
        
        if (match && match[1]) {
            console.log("成功从HTML中提取到 __INITIAL_STATE__");
            const initialState = JSON.parse(match[1]);
            
            // 尝试从多个可能的字段获取书籍列表
            const books = initialState?.shelf?.books || initialState?.shelf?.rawBooks || [];
            
            if (books.length > 0) {
                console.log(`书架中共有 ${books.length} 本书 (从HTML中解析成功)`);
                return books;
            } else {
                console.warn("解析成功，但在 __INITIAL_STATE__ 中未找到书籍数据。");
                console.log("原始 __INITIAL_STATE__.shelf 数据:", JSON.stringify(initialState?.shelf, null, 2));
                return [];
            }
        } else {
            console.error("书架API响应正常，但未能从HTML中用正则表达式匹配到 __INITIAL_STATE__ 数据。");
            return [];
        }
    } catch (error: any) {
        console.error("获取并解析书架列表失败:", error.message);
        if (error.response) {
            console.error("响应状态码:", error.response.status);
            console.error("响应头:", JSON.stringify(error.response.headers, null, 2));
            // 只打印前500个字符以防日志过长
            const responseData = typeof error.response.data === 'string' ? error.response.data.substring(0, 500) : JSON.stringify(error.response.data);
            console.error("响应体预览:", responseData);
        }
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

