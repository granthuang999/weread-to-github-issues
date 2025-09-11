/**
 * 微信读书API服务模块 (最终版 - 仅获取书架)
 */
import axios from "axios";
import { WEREAD_BASE_URL, BOOKSHELF_URL } from "../../config/constants";
import { getHeaders } from "../../utils/http";
import { updateCookieFromResponse } from "../../utils/cookie";

/**
 * 刷新微信读书会话
 */
export async function refreshSession(currentCookie: string): Promise<string> {
  console.log("正在刷新微信读书会话...");
  let updatedCookie = currentCookie;
  try {
    const headers = { ...getHeaders(updatedCookie), Referer: WEREAD_BASE_URL };
    const response = await axios.get(BOOKSHELF_URL, { headers, maxRedirects: 5 });

    if (response.headers["set-cookie"]) {
      console.log("服务端返回了新的Cookie，正在更新...");
      updatedCookie = updateCookieFromResponse(updatedCookie, response.headers["set-cookie"]);
    }
    console.log("会话刷新完成。");
  } catch (error: any) {
    console.warn(`刷新会话时遇到问题: ${error.message}. 将继续尝试使用现有Cookie.`);
  }
  return updatedCookie;
}

/**
 * 从微信读书书架获取所有书籍列表 (全新逻辑 - 从HTML解析)
 */
export async function getBookshelfBooks(cookie: string): Promise<any[]> {
  console.log("\n=== 从微信读书书架获取书籍列表 (HTML解析模式) ===");
  try {
    const headers = getHeaders(cookie);
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
        console.warn("解析成功，但在 __INITIAL_STATE__ 中未找到 'booksAndArchives' 数据。");
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

