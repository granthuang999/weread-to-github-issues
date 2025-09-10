/**
 * Constants used in the project (Final Correction)
 * This version unifies all API calls to the modern i.weread.qq.com domain.
 */

// Local directory to store sync state files, required for compilation.
export const SYNC_STATE_DIR = "data/sync-state";

// The primary domain for WeRead data APIs
export const WEREAD_API_URL = "https://i.weread.qq.com";

// A more reliable, modern endpoint for fetching the bookshelf list
export const BOOKSHELF_URL = `${WEREAD_API_URL}/shelf/friendCommon`;

// This endpoint remains correct for fetching books with notes
export const NOTEBOOK_API = `${WEREAD_API_URL}/user/notebooks`;

// Other APIs updated to the consistent domain
export const BOOK_INFO_URL = `${WEREAD_API_URL}/book/info`;
export const BOOKMARKS_API = `${WEREAD_API_URL}/book/bookmarklist`;
export const BOOK_THOUGHTS_API = `${WEREAD_API_URL}/review/list`;
export const BOOK_PROGRESS_API = `${WEREAD_API_URL}/book/progress`;

