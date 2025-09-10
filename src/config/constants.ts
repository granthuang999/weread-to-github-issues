/**
 * Constants used in the project (Final Corrected Version)
 * This version ensures all API calls point to the correct i.weread.qq.com JSON endpoints.
 */

// Local directory to store sync state files
export const SYNC_STATE_DIR = "data/sync-state";

// Base domain for WeRead web (used mainly for Referer / headers)
export const WEREAD_BASE_URL = "https://weread.qq.com";

// ✅ Correct API base domain for JSON data
const WEREAD_API_BASE = "https://i.weread.qq.com";

// API Endpoints (must use i.weread.qq.com to get JSON, not HTML)
export const BOOKSHELF_URL     = `${WEREAD_API_BASE}/shelf/sync`;
export const BOOK_INFO_URL     = `${WEREAD_API_BASE}/book/info`;
export const BOOKMARKS_API     = `${WEREAD_API_BASE}/book/bookmarklist`;
export const BOOK_THOUGHTS_API = `${WEREAD_API_BASE}/review/list`;
export const BOOK_PROGRESS_API = `${WEREAD_API_BASE}/book/readinfo`;
export const NOTEBOOK_API      = `${WEREAD_API_BASE}/user/notebooks`;
