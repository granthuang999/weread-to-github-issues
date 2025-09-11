/**
 * Markdown 生成器
 * 负责将书籍列表数据渲染成一个 GitHub Issue 支持的 Markdown 表格
 */
import { Book } from "../config/types";

/**
 * 根据书籍列表生成 Markdown 内容
 * @param books 从微信读书获取的书籍数组
 * @returns 完整的 Markdown 字符串
 */
export function generateBookshelfMarkdown(books: Book[]): string {
  // Markdown 表格的头部
  let markdown = `| 封面 | 书名 | 作者 | 分类 | 阅读状态 |\n`;
  markdown += `|:---:|:---|:---|:---|:---:|\n`;

  // 遍历书籍数据，生成每一行
  books.forEach(book => {
    const cover = `<a href="https://weread.qq.com/web/reader/${book.bookId}" target="_blank"><img src="${book.cover}" alt="${book.title}" width="60" /></a>`;
    const title = `[《${book.title}》](https://weread.qq.com/web/reader/${book.bookId})`;
    const author = book.author || '未知作者';
    const category = book.category || '无';
    const status = book.finishReading === 1 ? '✅ 已读' : '📖 在读';

    markdown += `| ${cover} | ${title} | ${author} | ${category} | ${status} |\n`;
  });

  return markdown;
}
