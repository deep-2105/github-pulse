import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";
import { App } from "octokit";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const appId = Number(process.env.GITHUB_APP_ID);
const installationId = Number(process.env.GITHUB_INSTALLATION_ID);
const privateKeyFromEnv = process.env.GITHUB_PRIVATE_KEY;
const privateKeyPath = process.env.GITHUB_PRIVATE_KEY_PATH
  ? path.resolve(__dirname, "..", process.env.GITHUB_PRIVATE_KEY_PATH)
  : null;

if (!appId || !installationId) {
  throw new Error("GitHub App environment variables are missing.");
}

const privateKey = privateKeyFromEnv
  ? privateKeyFromEnv.replace(/\\n/g, "\n")
  : (() => {
      if (!privateKeyPath) {
        throw new Error("GitHub private key environment variable is missing.");
      }

      if (!fs.existsSync(privateKeyPath)) {
        throw new Error(`GitHub private key not found: ${privateKeyPath}`);
      }

      return fs.readFileSync(privateKeyPath, "utf8");
    })();

export const githubApp = new App({
  appId,
  privateKey,
});

export async function getInstallationOctokit() {
  return githubApp.getInstallationOctokit(installationId);
}

export async function getGitHubProfile(username = "deep-2105") {
  const octokit = await getInstallationOctokit();
  const { data } = await octokit.request("GET /users/{username}", { username });
  return data;
}

export async function getUserProfile(username = "deep-2105") {
  const octokit = await getInstallationOctokit();
  const { data } = await octokit.request("GET /users/{username}", { username });
  return data;
}

export async function getUserRepos(username = "deep-2105", options = {}) {
  const octokit = await getInstallationOctokit();
  const { data } = await octokit.request("GET /users/{username}/repos", {
    username,
    sort: options.sort || "pushed",
    direction: options.direction || "desc",
    per_page: options.per_page || 100,
    page: options.page || 1,
  });
  return data;
}

export async function getRepoDetails(owner = "deep-2105", repo = "github-pulse") {
  const octokit = await getInstallationOctokit();
  const { data } = await octokit.request("GET /repos/{owner}/{repo}", {
    owner,
    repo,
  });
  return data;
}

export async function getRepoCommits(owner = "deep-2105", repo = "github-pulse", options = {}) {
  const octokit = await getInstallationOctokit();
  const { data } = await octokit.request("GET /repos/{owner}/{repo}/commits", {
    owner,
    repo,
    per_page: options.per_page || 30,
    page: options.page || 1,
  });
  return data;
}

export async function getRepoPulls(owner = "deep-2105", repo = "github-pulse", options = {}) {
  const octokit = await getInstallationOctokit();
  const { data } = await octokit.request("GET /repos/{owner}/{repo}/pulls", {
    owner,
    repo,
    state: options.state || "all",
    per_page: options.per_page || 30,
    page: options.page || 1,
  });
  return data;
}

export async function getRepoIssues(owner = "deep-2105", repo = "github-pulse", options = {}) {
  const octokit = await getInstallationOctokit();
  const { data } = await octokit.request("GET /repos/{owner}/{repo}/issues", {
    owner,
    repo,
    state: options.state || "all",
    per_page: options.per_page || 30,
    page: options.page || 1,
  });
  return data;
}

export async function getRepoLanguages(owner = "deep-2105", repo = "github-pulse") {
  const octokit = await getInstallationOctokit();
  const { data } = await octokit.request("GET /repos/{owner}/{repo}/languages", {
    owner,
    repo,
  });
  return data;
}

export async function getRepoContributors(owner = "deep-2105", repo = "github-pulse") {
  const octokit = await getInstallationOctokit();
  const { data } = await octokit.request("GET /repos/{owner}/{repo}/contributors", {
    owner,
    repo,
    per_page: 30,
  });
  return data;
}

export async function getRepoBranches(owner = "deep-2105", repo = "github-pulse") {
  const octokit = await getInstallationOctokit();
  const { data } = await octokit.request("GET /repos/{owner}/{repo}/branches", {
    owner,
    repo,
    per_page: 50,
  });
  return data;
}

export async function getUserEvents(username = "deep-2105", options = {}) {
  const octokit = await getInstallationOctokit();
  const { data } = await octokit.request("GET /users/{username}/events", {
    username,
    per_page: options.per_page || 50,
    page: options.page || 1,
  });
  return data;
}


