/**
 * HTML 生成器
 * 负责将书籍列表数据渲染成一个静态HTML页面 (最终版)
 */
import { Book } from "../config/types";
import * as fs from "fs";
import * as path from "path";

/**
 * 根据书籍列表生成HTML内容
 * @param books 从微信读书获取的书籍数组
 * @returns 完整的HTML字符串
 */
export function generateBookshelfHtml(books: Book[]): string {
  const head = `
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>我的微信读书书架</title>
      <script src="https://cdn.tailwindcss.com"></script>
      <link rel="preconnect" href="https://fonts.googleapis.com">
      <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
      <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@400;500;700&display=swap" rel="stylesheet">
      <style>
        body { font-family: 'Noto Sans SC', sans-serif; }
        .book-cover {
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        .book-cover:hover {
          transform: scale(1.05) translateY(-5px);
          box-shadow: 0 10px 20px rgba(0,0,0,0.2), 0 6px 6px rgba(0,0,0,0.23);
        }
      </style>
    </head>
  `;

  const bookCards = books.map(book => {
    let statusBadge = '';
    if (book.finishReading === 1) {
        statusBadge = `<span class="absolute top-2 right-2 bg-green-500 text-white text-xs font-semibold px-2 py-1 rounded-full shadow-md">已读</span>`;
    } else {
        statusBadge = `<span class="absolute top-2 right-2 bg-blue-500 text-white text-xs font-semibold px-2 py-1 rounded-full shadow-md">在读</span>`;
    }

    const publishYear = book.publishTime ? new Date(book.publishTime).getFullYear() : '';

    return `
    <div class="book-card flex flex-col items-center text-center group p-2">
      <div class="relative mb-3">
        <a href="https://weread.qq.com/web/reader/${book.bookId}" target="_blank" rel="noopener noreferrer">
          <img 
            src="${book.cover}" 
            alt="${book.title}" 
            class="book-cover w-36 h-52 lg:w-40 lg:h-60 object-cover rounded-md shadow-lg bg-gray-200"
            onerror="this.onerror=null;this.src='https://weread-1258476243.file.myqcloud.com/app/assets/bookcover/book_cover_default.svg';"
          >
        </a>
        ${statusBadge}
      </div>
      <h3 class="text-sm font-bold text-gray-800 dark:text-gray-200 w-36 lg:w-40 truncate" title="${book.title}">${book.title}</h3>
      <p class="text-xs text-gray-500 dark:text-gray-400 mt-1 w-36 lg:w-40 truncate" title="${book.author || '未知作者'}">${book.author || '未知作者'}</p>
      <p class="text-xs text-gray-400 dark:text-gray-500 mt-1 w-36 lg:w-40 truncate" title="${book.publisher || ''}">${book.publisher || ''}</p>
      <p class="text-xs text-gray-400 dark:text-gray-500 mt-1">${publishYear}</p>
    </div>
  `}).join('');

  const body = `
    <body class="bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <div class="container mx-auto px-4 py-8">
        <header class="text-center mb-12">
          <h1 class="text-4xl font-bold">我的书架</h1>
          <p class="text-gray-500 dark:text-gray-400 mt-2">共 ${books.length} 本书・同步于 ${new Date().toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' })}</p>
        </header>
        <main class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-x-4 gap-y-8">
          ${bookCards}
        </main>
        <footer class="text-center mt-12 text-gray-400 dark:text-gray-500 text-sm">
          <p>由 WeRead Sync 工具自动生成</p>
        </footer>
      </div>
    </body>
  `;

  return `<!DOCTYPE html><html lang="zh-CN">${head}${body}</html>`;
}

