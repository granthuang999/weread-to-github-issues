/**
 * Type definitions for the weread-to-github-issues project
 */

// Represents the basic information of a book
export interface Book {
  bookId: string;
  title: string;
  author: string;
  cover: string;
  [key: string]: any; // Allows for other properties
}

// Represents a single formatted highlight with its metadata
export interface FormattedHighlight {
  bookmarkId: string;
  chapterTitle: string;
  createdTime: string;
  text: string;
  range?: string; // Added optional range property
}

// Represents a chapter containing multiple highlights
export interface FormattedChapter {
  chapterTitle: string;
  highlights: FormattedHighlight[];
}

// Represents a single user thought/note, linked to a highlight
export interface FormattedThought {
  bookmarkId: string; // Changed from reviewId for consistency
  chapterTitle: string;
  createdTime: string;
  content: string; // The user's thought/comment
  originalText?: string; // The original highlighted text associated with the thought
  abstract?: string; // Added optional abstract property
  reviewId?: string; // Added optional reviewId property
}

// Represents the structure of the response when fetching highlights
export interface HighlightsResponse {
  highlights: FormattedChapter[];
  bookInfo: Book | null;
  synckey: string;
  hasUpdate: boolean;
}

// Represents the structure of the response when fetching thoughts
export interface ThoughtsResponse {
  thoughts: FormattedThought[];
  synckey: string;
  hasUpdate: boolean;
}

// Represents the local sync state for a book (used by file.ts)
export interface SyncState {
  bookId: string;
  lastSyncTime: number;
  highlightsSynckey: string;
  thoughtsSynckey: string;
}

