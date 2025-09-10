/**
 * Constants used in the project (Final Decisive Correction)
 * This version combines the stable, original API structure with the new, working endpoint for notebooks.
 */

// Local directory to store sync state files, required for compilation.
export const SYNC_STATE_DIR = "data/sync-state";

// The base domain for the WeRead web application, used for most operations and for setting correct headers.
export const WEREAD_BASE_URL = "https://weread.qq.com";

// Original, stable API Endpoints from the weread.qq.com domain
export const BOOKSHELF_URL = `${WEREAD_BASE_URL}/web/shelf`;
export const BOOK_INFO_URL = `${WEREAD_BASE_URL}/web/book/info`;
export const BOOKMARKS_API = `${WEREAD_BASE_URL}/web/book/bookmarklist`;
export const BOOK_THOUGHTS_API = `${WEREAD_BASE_URL}/web/review/list`;
export const BOOK_PROGRESS_API = `${WEREAD_BASE_URL}/web/book/progress`;

// The ONLY endpoint that has been confirmed to be moved.
// We are now using the correct, working endpoint for fetching notebooks from the data domain.
export const NOTEBOOK_API = "https://i.weread.qq.com/user/notebooks";

