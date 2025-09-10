/**
 * HTTP请求工具 (最终修正版)
 */

import { WEREAD_API_URL } from '../config/constants';

/**
 * 获取标准请求头
 * 核心修正：Referer 和 Origin 必须指向 i.weread.qq.com
 */
export function getHeaders(cookie: string): Record<string, string> {
  return {
    Cookie: cookie,
    "User-Agent":
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36",
    Accept: "application/json, text/plain, */*",
    "Accept-Language": "zh-CN,zh;q=0.9,en;q=0.8,zh-TW;q=0.7",
    "Accept-Encoding": "gzip, deflate, br, zstd",
    "Content-Type": "application/json",
    // 关键修正：确保来源域正确
    Referer: WEREAD_API_URL,
    Origin: WEREAD_API_URL,
  };
}

/**
 * 获取微信读书划线请求头
 * 包含特定的referer和sec-*头信息
 */
export function getHighlightHeaders(
  cookie: string,
  bookId: string
): Record<string, string> {
  return {
    ...getHeaders(cookie), // 复用标准请求头，确保 Origin 和 Referer 正确
    // 覆盖特定的 Referer
    Referer: `https://i.weread.qq.com/web/reader/${bookId}`,
  };
}
