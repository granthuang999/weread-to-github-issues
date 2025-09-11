/**
 * GitHub API 服务模块 (仅操作当前仓库)
 */
import { Octokit } from "@octokit/rest";

// 从环境变量中安全地获取配置
const GITHUB_TOKEN = process.env.WEREAD_PAT || "";
// 【关键】: 从Actions自动提供的变量中获取仓库信息
const REPO_DETAILS = process.env.GITHUB_REPOSITORY || ""; // e.g., "granthuang999/weread-to-github-issues"
const [REPO_OWNER, REPO_NAME] = REPO_DETAILS.split('/');

// 初始化Octokit客户端
const octokit = new Octokit({ auth: GITHUB_TOKEN });

const BOOKSHELF_ISSUE_TITLE = "我的微信读书书架 / My WeRead Bookshelf";

/**
 * 查找或创建一个专用于展示书架的Issue
 */
export async function findOrCreateBookshelfIssue(): Promise<any | null> {
  if (!REPO_OWNER || !REPO_NAME) {
    console.error("无法从环境变量 GITHUB_REPOSITORY 中获取仓库信息。");
    return null;
  }
  console.log(`在当前仓库 ${REPO_OWNER}/${REPO_NAME} 中搜索 issue...`);
  try {
    const { data: issues } = await octokit.search.issuesAndPullRequests({
      q: `repo:${REPO_OWNER}/${REPO_NAME} is:issue is:open in:title "${BOOKSHELF_ISSUE_TITLE}"`,
    });

    if (issues.items.length > 0) {
      const issue = issues.items[0];
      console.log(`找到已存在的书架 issue #${issue.number}.`);
      return issue;
    } else {
      console.log("未找到书架 issue，正在创建一个新的...");
      const { data: newIssue } = await octokit.issues.create({
        owner: REPO_OWNER,
        repo: REPO_NAME,
        title: BOOKSHELF_ISSUE_TITLE,
        body: "📚 此 issue 由 WeRead Sync 工具自动更新我的微信读书书架。",
        labels: ["bookshelf", "automated"],
      });
      console.log(`成功创建新的书架 issue #${newIssue.number}.`);
      return newIssue;
    }
  } catch (error: any) {
    console.error("查找或创建书架 issue 时出错:", error.message);
    return null;
  }
}

/**
 * 用最新的 Markdown 内容更新书架Issue
 */
export async function updateBookshelfIssue(issueNumber: number, markdownContent: string): Promise<void> {
    console.log(`正在用最新的书架内容更新 issue #${issueNumber}...`);
    try {
        const body = `
${markdownContent}

---
*Last updated: ${new Date().toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' })}*
`;
        await octokit.issues.update({
            owner: REPO_OWNER,
            repo: REPO_NAME,
            issue_number: issueNumber,
            body: body,
        });
        console.log(`✅ 成功更新 issue #${issueNumber}.`);
    } catch (error: any) {
        console.error(`更新 issue #${issueNumber} 时出错:`, error.message);
    }
}

