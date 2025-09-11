/**
 * HTML 生成器
 * 负责将书籍列表数据渲染成一个静态HTML页面 (升级版)
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
  // HTML头部，引入Tailwind CSS和字体
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

  // 根据书籍数据生成每个书籍卡片
  const bookCards = books.map(book => {
    // 【新增】确定阅读状态和对应的徽章颜色
    let statusBadge = '';
    // finishReading 为 1 代表已读完
    if (book.finishReading === 1) {
        statusBadge = `<span class="absolute top-2 right-2 bg-green-500 text-white text-xs font-semibold px-2 py-1 rounded-full shadow-md">已读</span>`;
    } else {
        statusBadge = `<span class="absolute top-2 right-2 bg-blue-500 text-white text-xs font-semibold px-2 py-1 rounded-full shadow-md">在读</span>`;
    }

    return `
    <div class="book-card flex flex-col items-center text-center group">
      <div class="relative">
        <a href="https://weread.qq.com/web/reader/${book.bookId}" target="_blank" rel="noopener noreferrer">
          <img src="${book.cover}" alt="${book.title}" class="book-cover w-32 h-48 lg:w-40 lg:h-60 object-cover rounded-md shadow-lg mb-3 bg-gray-200">
        </a>
        ${statusBadge}
      </div>
      <h3 class="text-sm font-bold text-gray-800 dark:text-gray-200 w-32 lg:w-40 truncate" title="${book.title}">${book.title}</h3>
      <p class="text-xs text-gray-500 dark:text-gray-400 mt-1 w-32 lg:w-40 truncate" title="${book.author}">${book.author || '未知作者'}</p>
      <!-- 【新增】显示书籍分类 -->
      <p class="text-xs text-gray-400 dark:text-gray-500 mt-1">${book.category || ''}</p>
    </div>
  `}).join('');

  // 完整的HTML页面结构
  const body = `
    <body class="bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <div class="container mx-auto px-4 py-8">
        <header class="text-center mb-12">
          <h1 class="text-4xl font-bold">我的书架</h1>
          <p class="text-gray-500 dark:text-gray-400 mt-2">共 ${books.length} 本书・同步于 ${new Date().toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' })}</p>
        </header>
        <main class="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 gap-6 md:gap-8">
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

/**
 * 将生成的HTML内容写入到文件
 * @param htmlContent HTML字符串
 * @param outputPath 输出路径，默认为项目根目录下的 'book.html'
 */
export function writeHtmlToFile(htmlContent: string, outputPath: string = "book.html"): void {
  try {
    const fullPath = path.resolve(process.cwd(), outputPath);
    fs.writeFileSync(fullPath, htmlContent, 'utf8');
    console.log(`\n✅ 成功生成书架页面: ${fullPath}`);
  } catch (error) {
    console.error("写入HTML文件失败:", error);
  }
}

