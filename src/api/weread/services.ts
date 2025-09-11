/**
 * 微信读书API服务模块 (最终策略版)
 */

import axios from "axios";
import {
  BOOKMARKS_API,
  BOOKSHELF_URL,
  BOOK_INFO_URL,
  BOOK_THOUGHTS_API,
} from "../../config/constants";
// 关键修正：导入 getApiHeaders 和 getShelfHeaders
import { getApiHeaders, getHighlightHeaders, getShelfHeaders } from "../../utils/http";
import { updateCookieFromResponse } from "../../utils/cookie";
import {
  RawHighlightsData
} from "./models";

/**
 * 刷新会话的逻辑
 */
export async function refreshSession(currentCookie: string): Promise<string> {
  console.log("正在刷新微信读书会话...");
  try {
    const headers = getShelfHeaders(currentCookie);
    const response = await axios.get(BOOKSHELF_URL, { headers, maxRedirects: 5 });

    if (response.headers["set-cookie"]) {
      console.log("服务端返回了新的Cookie，正在更新...");
      return updateCookieFromResponse(currentCookie, response.headers["set-cookie"]);
    }
  } catch (error: any) {
    console.warn(`刷新会话时遇到问题: ${error.message}. 将继续尝试使用现有Cookie.`);
  }
  return currentCookie;
}


/**
 * 从微信读书书架获取所有书籍列表
 */
export async function getBookshelfBooks(cookie: string): Promise<any[]> {
    console.log("\n=== 从微信读书书架获取书籍列表 (HTML解析模式) ===");
    try {
        const headers = getShelfHeaders(cookie); // 使用网页 Headers
        const response = await axios.get(BOOKSHELF_URL, { headers });

        if (typeof response.data !== 'string' || !response.data.includes('<html')) {
            console.error("书架API未返回HTML页面，返回内容:", response.data);
            return [];
        }

        const match = response.data.match(/window\.__INITIAL_STATE__\s*=\s*({.*?});/);
        
        if (match && match[1]) {
            const initialState = JSON.parse(match[1]);
            const books = initialState?.shelf?.booksAndArchives || [];
            
            if (books.length > 0) {
                console.log(`书架中共有 ${books.length} 本书 (从HTML中解析成功)`);
                return books;
            } else {
                console.warn("解析成功，但在 __INITIAL_STATE__ 中未找到 `booksAndArchives` 数据。");
                return [];
            }
        } else {
            console.error("书架API响应正常，但未能从HTML中匹配到 __INITIAL_STATE__ 数据。");
            return [];
        }
    } catch (error: any) {
        console.error("获取并解析书架列表失败:", error.message);
        if (error.response) {
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
    const headers = getApiHeaders(cookie); // 使用API Headers
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

