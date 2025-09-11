/**
 * Constants used in the project (Final API Correction)
 * All endpoints now consistently use the i.weread.qq.com data domain.
 */

// Local directory to store sync state files, required for compilation.
export const SYNC_STATE_DIR = "data/sync-state";

// The base domain for the WeRead web application, used for fetching the main HTML.
export const WEREAD_BASE_URL = "https://weread.qq.com";

// The primary domain for WeRead data APIs.
export const WEREAD_API_URL = "https://i.weread.qq.com";

// Endpoint for fetching the bookshelf HTML page.
export const BOOKSHELF_URL = `${WEREAD_BASE_URL}/web/shelf`;

// Data endpoints for fetching details.
export const NOTEBOOK_API = `${WEREAD_API_URL}/user/notebooks`;
export const BOOK_INFO_URL = `${WEREAD_API_URL}/book/info`;
export const BOOKMARKS_API = `${WEREAD_API_URL}/book/bookmarklist`;
export const BOOK_THOUGHTS_API = `${WEREAD_API_URL}/review/list`;
export const BOOK_PROGRESS_API = `${WEREAD_API_URL}/book/progress`;

