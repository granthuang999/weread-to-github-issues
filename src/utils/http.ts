/**
 * HTTP请求工具 (最终API修正版)
 */
import { WEREAD_API_URL, WEREAD_BASE_URL } from '../config/constants';

/**
 * 获取用于 weread.qq.com 域（网页）的请求头
 */
export function getShelfHeaders(cookie: string): Record<string, string> {
  return {
    Cookie: cookie,
    "User-Agent":
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36",
    Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
    "Accept-Language": "zh-CN,zh;q=0.9",
    "Accept-Encoding": "gzip, deflate, br",
    Referer: WEREAD_BASE_URL,
    Origin: WEREAD_BASE_URL,
  };
}

/**
 * 获取用于 i.weread.qq.com 域（数据API）的请求头
 */
export function getApiHeaders(cookie: string): Record<string, string> {
  return {
    Cookie: cookie,
    "User-Agent":
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36",
    Accept: "application/json, text/plain, */*",
    "Accept-Language": "zh-CN,zh;q=0.9",
    "Accept-Encoding": "gzip, deflate, br",
    "Content-Type": "application/json",
    // 关键修正：确保来源域正确
    Referer: WEREAD_API_URL,
    Origin: WEREAD_API_URL,
  };
}

/**
 * 获取微信读书划线等详细信息的请求头
 */
export function getHighlightHeaders(
  cookie: string,
  bookId: string
): Record<string, string> {
  return {
    ...getApiHeaders(cookie), // 复用API请求头
    // 覆盖特定的 Referer, 模拟正在阅读这本书
    Referer: `${WEREAD_BASE_URL}/web/reader/${bookId}`, // 这里使用旧的 Referer 仍然有效
  };
}

