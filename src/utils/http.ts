/**
 * HTTP请求工具 (最终决定版修正)
 */

/**
 * 获取用于 weread.qq.com 域的标准请求头
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
    Referer: "https://weread.qq.com/web/shelf",
    Origin: "https://weread.qq.com",
  };
}

/**
 * 【新增】获取专用于 i.weread.qq.com 域的请求头
 * 核心修正：Referer 和 Origin 指向正确的数据接口域
 */
export function getNotebookHeaders(cookie: string): Record<string, string> {
  return {
    Cookie: cookie,
    "User-Agent":
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36",
    Accept: "application/json, text/plain, */*",
    "Accept-Language": "zh-CN,zh;q=0.9,en;q=0.8,zh-TW;q=0.7",
    "Accept-Encoding": "gzip, deflate, br, zstd",
    // 关键修正
    Referer: "https://i.weread.qq.com/",
    Origin: "https://i.weread.qq.com",
  };
}


/**
 * 获取微信读书划线请求头 (保持不变)
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
    "sec-ch-ua":
      '"Google Chrome";v="135", "Not-A.Brand";v="8", "Chromium";v="135"',
    "sec-ch-ua-mobile": "?0",
    "sec-ch-ua-platform": '"macOS"',
    "sec-fetch-dest": "empty",
    "sec-fetch-mode": "cors",
    "sec-fetch-site": "same-origin",
  };
}

