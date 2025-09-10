/**
 * HTTP请求工具 (恢复为原始项目的稳定逻辑)
 */

import { WEREAD_BASE_URL } from '../config/constants';

/**
 * 获取标准请求头
 * 核心修正：Referer 和 Origin 必须指向 weread.qq.com
 */
export function getHeaders(cookie: string): Record<string, string> {
  return {
    Cookie: cookie,
    "User-Agent":
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36",
    Accept: "application/json, text/plain, */*",
    "Content-Type": "application/json",
    // 关键修正：恢复为原始项目的来源域
    Referer: `${WEREAD_BASE_URL}/web/shelf`,
    Origin: WEREAD_BASE_URL,
  };
}

/**
 * 获取微信读书划线/想法请求头
 */
export function getHighlightHeaders(
  cookie: string,
  bookId: string
): Record<string, string> {
  return {
    ...getHeaders(cookie),
    // 覆盖为特定书籍阅读页面的 Referer
    Referer: `${WEREAD_BASE_URL}/web/reader/${bookId}`,
  };
}

