/**
 * HTTP 请求工具 (最终可替换版)
 * 目标：保持最小化、兼容性最高的请求头，避免 401 登录超时
 */

/**
 * 获取 weread.qq.com 域的标准请求头
 * 用于：书架、书籍信息、书签、进度等 API
 */
export function getHeaders(cookie: string): Record<string, string> {
  return {
    Cookie: cookie,
    "User-Agent":
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36",
    Accept: "application/json, text/plain, */*",
    "Accept-Language": "zh-CN,zh;q=0.9,en;q=0.8,zh-TW;q=0.7",
    "Accept-Encoding": "gzip, deflate, br, zstd",
    Referer: "https://weread.qq.com/",
    Origin: "https://weread.qq.com",
  };
}

/**
 * 获取 i.weread.qq.com 域的请求头
 * 用于：笔记本 API (https://i.weread.qq.com/user/notebooks)
 * ⚠️ 核心：Referer / Origin 必须仍指向 weread.qq.com，而不是 i.weread.qq.com
 */
export function getNotebookHeaders(cookie: string): Record<string, string> {
  return {
    Cookie: cookie,
    "User-Agent":
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36",
    Accept: "application/json, text/plain, */*",
    "Accept-Language": "zh-CN,zh;q=0.9,en;q=0.8,zh-TW;q=0.7",
    "Accept-Encoding": "gzip, deflate, br, zstd",
    Referer: "https://weread.qq.com/",
    Origin: "https://weread.qq.com",
  };
}

/**
 * 获取划线 / 笔记请求头
 * 用于：获取某本书的高亮 (reader 页面 API)
 */
export function getHighlightHeaders(
  cookie: string,
  bookId: string
): Record<string, string> {
  return {
    Cookie: cookie,
    "User-Agent":
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36",
    Accept: "application/json, text/plain, */*",
    "Accept-Language": "zh-CN,zh;q=0.9,en;q=0.8,zh-TW;q=0.7",
    "Accept-Encoding": "gzip, deflate, br, zstd",
    Referer: `https://weread.qq.com/web/reader/${bookId}`,
    Origin: "https://weread.qq.com",
  };
}
