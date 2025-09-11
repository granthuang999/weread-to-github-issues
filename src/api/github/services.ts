/**
 * GitHub API 服务模块 (优化版)
 */
import { Octokit } from "@octokit/rest";
import { Book } from "../../config/types";

// 从环境变量中安全地获取配置
const GITHUB_TOKEN = process.env.GITHUB_TOKEN || "";
const REPO_OWNER = process.env.GITHUB_REPO_OWNER || "";
const REPO_NAME = process.env.GITHUB_REPO_NAME || "";

// 初始化Octokit客户端
const octokit = new Octokit({ auth: GITHUB_TOKEN });

/**
 * 【全新逻辑】一次性获取仓库中所有由本工具创建的Issues
 * @returns A Map where key is bookId and value is the issue object.
 */
export async function getAllBookIssuesMap(): Promise<Map<string, any>> {
  const issuesMap = new Map<string, any>();
  console.log(`Fetching all existing book issues from ${REPO_OWNER}/${REPO_NAME}...`);
  try {
    const issues = await octokit.paginate(octokit.issues.listForRepo, {
      owner: REPO_OWNER,
      repo: REPO_NAME,
      state: "open", // 只获取开放的issues
      labels: "weread", // 只获取带有 'weread' 标签的 issues
    });

    for (const issue of issues) {
      const match = issue.body?.match(/<!-- bookId: (.*?) -->/);
      if (match && match[1]) {
        const bookId = match[1];
        issuesMap.set(bookId, issue);
      }
    }
    console.log(`Found ${issuesMap.size} existing book issues.`);
    return issuesMap;
  } catch (error: any) {
    console.error("Error fetching repository issues:", error.message);
    // 如果获取失败，返回一个空Map，程序将尝试创建新Issues
    return issuesMap;
  }
}

/**
 * 为一本书创建一个新的Issue
 */
export async function createNewIssueForBook(book: Book): Promise<number | null> {
  try {
    const body = `
### 📖 《${book.title}》
**作者**: ${book.author || "未知"}

---
*此 Issue 由 WeRead Sync 工具自动创建。*
<!-- bookId: ${book.bookId} -->
    `;

    const response = await octokit.issues.create({
      owner: REPO_OWNER,
      repo: REPO_NAME,
      title: `读书笔记：${book.title}`,
      body: body,
      labels: ["weread", "reading-notes"], // 自动打上标签
    });

    if (response.status === 201) {
      console.log(`Successfully created new issue #${response.data.number} for book: ${book.title}`);
      return response.data.number;
    }
    return null;
  } catch (error: any) {
    console.error(`Error creating issue for book "${book.title}":`, error.message);
    return null;
  }
}

