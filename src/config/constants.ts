/**
 * Constants used in the project (Reverted to Original)
 */

// Local directory to store sync state files, required for compilation.
export const SYNC_STATE_DIR = "data/sync-state";

// Reverting to the original, stable weread.qq.com domain for all APIs
export const WEREAD_BASE_URL = "https://weread.qq.com";

// Original API Endpoints that are known to be effective
export const BOOKSHELF_URL = `${WEREAD_BASE_URL}/web/shelf`;
export const NOTEBOOK_API = `${WEREAD_BASE_URL}/web/notebooks`;
export const BOOK_INFO_URL = `${WEREAD_BASE_URL}/web/book/info`;
export const BOOKMARKS_API = `${WEREAD_BASE_URL}/web/book/bookmarklist`;
export const BOOK_THOUGHTS_API = `${WEREAD_BASE_URL}/web/review/list`;
export const BOOK_PROGRESS_API = `${WEREAD_BASE_URL}/web/book/progress`;

