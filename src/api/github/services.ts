/**
 * GitHub API 服务模块 (单一Issue管理版)
 */
import { Octokit } from "@octokit/rest";

// 从环境变量中安全地获取配置
const GITHUB_TOKEN = process.env.GITHUB_TOKEN || "";
const REPO_OWNER = process.env.GITHUB_REPO_OWNER || "";
const REPO_NAME = process.env.GITHUB_REPO_NAME || "";

// 初始化Octokit客户端
const octokit = new Octokit({ auth: GITHUB_TOKEN });

// 定义我们将要管理的那个唯一的Issue的标题
const BOOKSHELF_ISSUE_TITLE = "我的微信读书书架 / My WeRead Bookshelf";

/**
 * 查找或创建一个专用于展示书架的Issue
 * @returns The issue object found or created.
 */
export async function findOrCreateBookshelfIssue(): Promise<any | null> {
  console.log(`Searching for the dedicated bookshelf issue with title: "${BOOKSHELF_ISSUE_TITLE}"`);
  try {
    // 搜索仓库中是否有这个标题的Issue
    const { data: issues } = await octokit.search.issuesAndPullRequests({
      q: `repo:${REPO_OWNER}/${REPO_NAME} is:issue is:open in:title "${BOOKSHELF_ISSUE_TITLE}"`,
    });

    if (issues.items.length > 0) {
      const issue = issues.items[0];
      console.log(`Found existing bookshelf issue #${issue.number}.`);
      return issue;
    } else {
      console.log("Bookshelf issue not found. Creating a new one...");
      const { data: newIssue } = await octokit.issues.create({
        owner: REPO_OWNER,
        repo: REPO_NAME,
        title: BOOKSHELF_ISSUE_TITLE,
        body: "📚 This issue is automatically updated with my WeRead bookshelf.",
        labels: ["bookshelf", "automated"],
      });
      console.log(`Successfully created new bookshelf issue #${newIssue.number}.`);
      return newIssue;
    }
  } catch (error: any) {
    console.error("Error finding or creating the bookshelf issue:", error.message);
    return null;
  }
}

/**
 * 用最新的HTML内容更新书架Issue
 * @param issueNumber The number of the issue to update.
 * @param htmlContent The full HTML content of the bookshelf.
 */
export async function updateBookshelfIssue(issueNumber: number, htmlContent: string): Promise<void> {
    console.log(`Updating issue #${issueNumber} with the latest bookshelf...`);
    try {
        // GitHub Issue body a markdown, we can embed HTML in it.
        // For better display, we wrap it in a details tag so it's collapsible.
        const body = `
<details>
<summary>点击展开/折叠我的书架 (更新于 ${new Date().toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' })})</summary>

${htmlContent}

</details>

*由 WeRead Sync 工具自动更新。*
`;
        await octokit.issues.update({
            owner: REPO_OWNER,
            repo: REPO_NAME,
            issue_number: issueNumber,
            body: body,
        });
        console.log(`✅ Successfully updated issue #${issueNumber}.`);
    } catch (error: any) {
        console.error(`Error updating issue #${issueNumber}:`, error.message);
    }
}

