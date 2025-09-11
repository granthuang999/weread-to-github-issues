/**
 * 微信读书API服务模块 (最终API修正版)
 */

import axios from "axios";
import {
  NOTEBOOK_API,
  BOOKMARKS_API,
  BOOKSHELF_URL,
  BOOK_INFO_URL,
  BOOK_PROGRESS_API,
  BOOK_THOUGHTS_API,
} from "../../config/constants";
// 关键修正：导入 getApiHeaders 和 getShelfHeaders
import { getApiHeaders, getHighlightHeaders, getShelfHeaders } from "../../utils/http";
import {
  RawHighlightsData,
  RawThoughtsData,
} from "./models";
import { getBookProgress } from "./book-progress";

// 重新导出getBookProgress函数
export { getBookProgress };

/**
 * 刷新会话的逻辑现在由获取数据前的实际API调用隐式处理，
 * 此处保留一个空函数以兼容旧的调用，但不再执行任何操作。
 */
export async function refreshSession(currentCookie: string): Promise<string> {
  console.log("会话刷新步骤已合并到首次API调用中，此处跳过。");
  return currentCookie;
}

/**
 * 从微信读书笔记本获取有笔记的书籍列表
 */
export async function getNotebookBooks(cookie: string): Promise<any[]> {
  console.log("\n=== 从微信读书笔记本获取书籍列表 ===");
  try {
    const headers = getApiHeaders(cookie); // 使用API Headers
    const response = await axios.get(NOTEBOOK_API, { headers });
    
    if (response.data && response.data.books) {
      const list = response.data.books;
      console.log(`笔记本中共有 ${list.length} 本书`);
      return list.map((item: any) => item.book || item);
    } else {
       console.log("笔记本API响应正常，但没有书籍数据。");
       return [];
    }
  } catch (error: any) {
    console.error("获取笔记本列表失败:", error.message);
    if (error.response) {
       console.error("响应状态码:", error.response.status);
       console.error("响应体:", JSON.stringify(error.response.data, null, 2));
    }
    return [];
  }
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
    const headers = getHighlightHeaders(cookie, bookId); // 使用专用的Highlight Headers
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
    const headers = getHighlightHeaders(cookie, bookId); // 使用专用的Highlight Headers
    const response = await axios.get(url, { headers });
    return response.data;
  } catch (error: any) {
    console.error(`获取书籍 ${bookId} 想法失败:`, error.message);
    return null;
  }
}

