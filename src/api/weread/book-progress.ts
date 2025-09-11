/**
 * 获取书籍阅读进度信息
 */
import axios from "axios";
import { BOOK_PROGRESS_API } from "../../config/constants";
// 关键修正：导入 getApiHeaders 而不是 getHeaders
import { getApiHeaders } from "../../utils/http";
import { BookProgressInfo } from "./models";
import { refreshSession } from "./services";

export async function getBookProgress(
  cookie: string,
  bookId: string
): Promise<BookProgressInfo | null> {
  console.log(`\n获取书籍(ID: ${bookId})的阅读进度...`);
  const url = `${BOOK_PROGRESS_API}?bookId=${bookId}`;

  try {
    // 设置请求头
    // 关键修正：使用 getApiHeaders
    const headers = getApiHeaders(cookie);

    console.log(`发送请求到: ${url}`);
    const response = await axios.get(url, { headers });

    // 检查是否登录超时 - 这个逻辑可能不再适用，但保留以防万一
    if (response.data.errCode === -2012) {
      console.log("检测到登录超时，正在重新刷新会话...");
      // 注意：这里的 refreshSession 可能不再有效，但我们保留它
      const newCookie = await refreshSession(cookie);
      // 重新发起请求
      return getBookProgress(newCookie, bookId);
    }

    if (response.data && response.data.book) {
       return response.data;
    } else {
      console.log(`未找到《${bookId}》的阅读进度数据`);
    }

    return response.data;
  } catch (error: any) {
    console.error(`获取书籍阅读进度失败:`, error.message);
    if (error.response) {
      console.error(`响应状态: ${error.response.status}`);
      console.error(`响应数据: ${JSON.stringify(error.response.data)}`);
    }
    return null;
  }
}
