/**
 * 微信读书客户端封装 (修正版)
 */

import {
  refreshSession,
  getNotebookBooks,
  getBookshelfBooks,
  getBookInfo,
  getBookHighlights,
  getBookThoughts,
} from "./services";
// 导入我们新的、统一的类型定义
import {
  ThoughtsResponse,
  HighlightsResponse,
  Book,
  FormattedChapter,
  FormattedHighlight,
  FormattedThought,
} from "../../config/types";
import { getBrowserCookie } from "../../utils/cookie";
import {
  RawHighlightsData,
  RawThoughtsData,
} from "./models";
import { getSyncState } from "../../utils/file";

/**
 * 微信读书客户端类
 */
export class WeReadClient {
  private cookie: string;

  /**
   * 构造函数
   */
  constructor(cookie?: string) {
    this.cookie = cookie || getBrowserCookie();
  }

  /**
   * 刷新Cookie
   */
  async refreshCookie(): Promise<string> {
    this.cookie = await refreshSession(this.cookie);
    return this.cookie;
  }

  /**
   * 获取划线数据并格式化
   */
  async getHighlights(
    bookId: string,
    useIncremental: boolean = true
  ): Promise<HighlightsResponse> {
    const syncState = useIncremental
      ? getSyncState(bookId)
      : { highlightsSynckey: "0" };

    const rawData = await getBookHighlights(
      this.cookie,
      bookId,
      syncState.highlightsSynckey
    );

    if (!rawData) {
      return {
        highlights: [],
        bookInfo: null,
        synckey: syncState.highlightsSynckey || "0",
        hasUpdate: false,
      };
    }
    
    const newSynckey = rawData.synckey || syncState.highlightsSynckey || "0";
    const hasUpdate = newSynckey !== (syncState.highlightsSynckey || "0");

    return {
      highlights: this.formatHighlightsData(rawData),
      bookInfo: rawData.book || null,
      synckey: newSynckey,
      hasUpdate: hasUpdate || (rawData.updated || []).length > 0,
    };
  }

  /**
   * 获取想法数据并格式化
   */
  async getThoughts(
    bookId: string,
    useIncremental: boolean = true
  ): Promise<ThoughtsResponse> {
    const syncState = useIncremental
      ? getSyncState(bookId)
      : { thoughtsSynckey: "0" };
    
    const rawData = await getBookThoughts(
      this.cookie,
      bookId,
      syncState.thoughtsSynckey
    );

    if (!rawData) {
      return {
        thoughts: [],
        synckey: syncState.thoughtsSynckey || "0",
        hasUpdate: false,
      };
    }

    const newSynckey = rawData.synckey || syncState.thoughtsSynckey || "0";
    const hasUpdate = newSynckey !== (syncState.thoughtsSynckey || "0");
    const thoughts = this.formatThoughtsData(rawData);

    return {
      thoughts,
      synckey: newSynckey,
      hasUpdate: hasUpdate || thoughts.length > 0,
    };
  }

  /**
   * 格式化划线原始数据
   */
  private formatHighlightsData(bookData: RawHighlightsData): FormattedChapter[] {
    const chapterMap = new Map<number, FormattedHighlight[]>();
    const chapters = bookData.chapters || [];
    const updatedHighlights = bookData.updated || [];
    
    // 创建章节标题映射
    const chapterTitleMap = new Map<number, string>();
    chapters.forEach(c => chapterTitleMap.set(c.chapterUid, c.title));

    updatedHighlights.forEach((highlight: any) => {
      if (!chapterMap.has(highlight.chapterUid)) {
        chapterMap.set(highlight.chapterUid, []);
      }
      chapterMap.get(highlight.chapterUid)!.push({
        bookmarkId: highlight.bookmarkId, // 修正：添加 bookmarkId
        text: highlight.markText,
        chapterTitle: chapterTitleMap.get(highlight.chapterUid) || highlight.chapterTitle || `章节 ${highlight.chapterUid}`,
        createdTime: this.formatTimestamp(highlight.created),
      });
    });

    const result: FormattedChapter[] = [];
    chapterMap.forEach((highlights, chapterUid) => {
      result.push({
        chapterTitle: chapterTitleMap.get(chapterUid) || highlights[0]?.chapterTitle || `章节 ${chapterUid}`,
        highlights: highlights,
      });
    });

    return result;
  }

  /**
   * 格式化想法原始数据
   */
  private formatThoughtsData(rawThoughtsData: RawThoughtsData): FormattedThought[] {
    const thoughts: FormattedThought[] = [];
    const rawReviews = rawThoughtsData.reviews || [];

    rawReviews.forEach((review: any) => {
      const thoughtData = review.review || {};
      
      // 想法内容可能在 review.content 或 review.review.content 中
      const content = thoughtData.content || review.content;
      // 关联的原文在 abstract 字段
      const originalText = thoughtData.abstract || review.abstract;
      
      if (content) {
        thoughts.push({
          bookmarkId: review.reviewId, // 修正：添加 bookmarkId (使用 reviewId)
          content: content,
          originalText: originalText,
          chapterTitle: thoughtData.chapterName || thoughtData.chapterTitle || review.chapterTitle || "未知章节",
          createdTime: this.formatTimestamp(thoughtData.createTime || review.createTime),
        });
      }
    });

    return thoughts;
  }
  
  /**
   * 格式化时间戳为本地时间字符串
   */
  private formatTimestamp(timestamp: number | string): string {
    if (!timestamp) return "未知时间";
    try {
      const ts = typeof timestamp === "number" ? timestamp : parseInt(timestamp);
      if (isNaN(ts)) return "未知时间";
      // 判断是毫秒还是秒级时间戳
      const date = ts > 9999999999 ? new Date(ts) : new Date(ts * 1000);
      return date.toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' });
    } catch (error) {
      return "未知时间";
    }
  }
}
