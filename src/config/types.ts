/**
 * Type definitions for the project
 */

// Represents the structure of a book object fetched from WeRead
export interface Book {
  bookId: string;
  title: string;
  author: string;
  cover: string;
  category?: string; // 书籍分类
  finishReading?: number; // 阅读状态 (1 for finished, 0 for in-progress)
  [key: string]: any; // Allows for other properties
}

