import express from "express";
import cors from "cors";
import {
  getInstallationOctokit,
  getUserProfile,
  getUserRepos,
  getRepoDetails,
  getRepoCommits,
  getRepoPulls,
  getRepoIssues,
  getRepoLanguages,
  getRepoContributors,
  getRepoBranches,
  getUserEvents,
} from "./github.js";

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Preserved original route
app.get("/api/github/repo", async (req, res) => {
  try {
    const octokit = await getInstallationOctokit();

    const { data } = await octokit.request(
      "GET /repos/{owner}/{repo}",
      {
        owner: "deep-2105",
        repo: "github-pulse",
      }
    );

    res.json({
      success: true,
      repository: {
        name: data.name,
        fullName: data.full_name,
        private: data.private,
        stars: data.stargazers_count,
        forks: data.forks_count,
        language: data.language,
        defaultBranch: data.default_branch,
      },
    });
  } catch (error) {
    console.error("GitHub API error:", error);

    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// Helper for user profile handler
const handleUserProfile = async (req, res) => {
  const username = req.params.username || req.query.username || "deep-2105";
  try {
    const profile = await getUserProfile(username);
    const repos = await getUserRepos(username, { per_page: 100 });

    const totalStars = repos.reduce((sum, r) => sum + (r.stargazers_count || 0), 0);
    const totalForks = repos.reduce((sum, r) => sum + (r.forks_count || 0), 0);
    const totalOpenIssues = repos.reduce((sum, r) => sum + (r.open_issues_count || 0), 0);

    // Language aggregation
    const languageCounts = {};
    repos.forEach((r) => {
      if (r.language) {
        languageCounts[r.language] = (languageCounts[r.language] || 0) + 1;
      }
    });

    res.json({
      success: true,
      user: {
        login: profile.login,
        name: profile.name || profile.login,
        avatarUrl: profile.avatar_url,
        htmlUrl: profile.html_url,
        bio: profile.bio,
        company: profile.company,
        blog: profile.blog,
        location: profile.location,
        email: profile.email,
        twitter: profile.twitter_username,
        publicRepos: profile.public_repos,
        publicGists: profile.public_gists,
        followers: profile.followers,
        following: profile.following,
        createdAt: profile.created_at,
        updatedAt: profile.updated_at,
        stats: {
          totalStars,
          totalForks,
          totalOpenIssues,
          totalRepos: repos.length,
          languageDistribution: languageCounts,
        },
      },
    });
  } catch (error) {
    console.error("Error fetching user profile:", error);
    res.status(error.status || 500).json({
      success: false,
      error: error.message,
    });
  }
};

app.get("/api/github/user", handleUserProfile);
app.get("/api/github/user/:username", handleUserProfile);


// List user repositories
app.get("/api/github/repos", async (req, res) => {
  const username = req.query.username || "deep-2105";
  const sort = req.query.sort || "pushed";
  try {
    const repos = await getUserRepos(username, { sort, per_page: 100 });

    const formattedRepos = repos.map((r) => ({
      id: r.id,
      name: r.name,
      fullName: r.full_name,
      owner: {
        login: r.owner.login,
        avatarUrl: r.owner.avatar_url,
      },
      private: r.private,
      htmlUrl: r.html_url,
      description: r.description,
      fork: r.fork,
      createdAt: r.created_at,
      updatedAt: r.updated_at,
      pushedAt: r.pushed_at,
      stars: r.stargazers_count,
      watchers: r.watchers_count,
      language: r.language,
      forks: r.forks_count,
      openIssues: r.open_issues_count,
      topics: r.topics || [],
      defaultBranch: r.default_branch,
      size: r.size,
    }));

    res.json({
      success: true,
      totalCount: formattedRepos.length,
      repositories: formattedRepos,
    });
  } catch (error) {
    console.error("Error fetching repositories:", error);
    res.status(error.status || 500).json({
      success: false,
      error: error.message,
    });
  }
});

// Single repository deep details
app.get("/api/github/repos/:owner/:repo", async (req, res) => {
  const { owner, repo } = req.params;
  try {
    const data = await getRepoDetails(owner, repo);

    res.json({
      success: true,
      repository: {
        id: data.id,
        name: data.name,
        fullName: data.full_name,
        owner: {
          login: data.owner.login,
          avatarUrl: data.owner.avatar_url,
          htmlUrl: data.owner.html_url,
        },
        private: data.private,
        htmlUrl: data.html_url,
        description: data.description,
        fork: data.fork,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
        pushedAt: data.pushed_at,
        homepage: data.homepage,
        size: data.size,
        stars: data.stargazers_count,
        watchers: data.watchers_count,
        language: data.language,
        forks: data.forks_count,
        openIssues: data.open_issues_count,
        topics: data.topics || [],
        defaultBranch: data.default_branch,
        license: data.license ? data.license.name : null,
      },
    });
  } catch (error) {
    console.error("Error fetching repo details:", error);
    res.status(error.status || 500).json({
      success: false,
      error: error.message,
    });
  }
});

// Repository commits
app.get("/api/github/repos/:owner/:repo/commits", async (req, res) => {
  const { owner, repo } = req.params;
  const perPage = Number(req.query.per_page) || 30;
  const page = Number(req.query.page) || 1;
  try {
    const commits = await getRepoCommits(owner, repo, { per_page: perPage, page });

    const formattedCommits = commits.map((c) => ({
      sha: c.sha,
      shortSha: c.sha.substring(0, 7),
      message: c.commit.message,
      author: {
        name: c.commit.author.name,
        email: c.commit.author.email,
        date: c.commit.author.date,
        login: c.author ? c.author.login : c.commit.author.name,
        avatarUrl: c.author ? c.author.avatar_url : null,
      },
      htmlUrl: c.html_url,
      commentCount: c.commit.comment_count,
    }));

    res.json({
      success: true,
      count: formattedCommits.length,
      commits: formattedCommits,
    });
  } catch (error) {
    console.error("Error fetching commits:", error);
    res.status(error.status || 500).json({
      success: false,
      error: error.message,
    });
  }
});

// Repository pull requests
app.get("/api/github/repos/:owner/:repo/pulls", async (req, res) => {
  const { owner, repo } = req.params;
  const state = req.query.state || "all";
  try {
    const pulls = await getRepoPulls(owner, repo, { state, per_page: 30 });

    const formattedPulls = pulls.map((p) => ({
      id: p.id,
      number: p.number,
      title: p.title,
      state: p.state,
      user: {
        login: p.user.login,
        avatarUrl: p.user.avatar_url,
      },
      createdAt: p.created_at,
      updatedAt: p.updated_at,
      closedAt: p.closed_at,
      mergedAt: p.merged_at,
      htmlUrl: p.html_url,
      draft: p.draft,
      labels: p.labels.map((l) => ({ name: l.name, color: l.color })),
    }));

    res.json({
      success: true,
      count: formattedPulls.length,
      pullRequests: formattedPulls,
    });
  } catch (error) {
    console.error("Error fetching pull requests:", error);
    res.status(error.status || 500).json({
      success: false,
      error: error.message,
    });
  }
});

// Repository issues
app.get("/api/github/repos/:owner/:repo/issues", async (req, res) => {
  const { owner, repo } = req.params;
  const state = req.query.state || "all";
  try {
    const issues = await getRepoIssues(owner, repo, { state, per_page: 30 });

    // Filter out pull requests as GitHub Issues API includes PRs
    const pureIssues = issues.filter((i) => !i.pull_request);

    const formattedIssues = pureIssues.map((i) => ({
      id: i.id,
      number: i.number,
      title: i.title,
      state: i.state,
      user: {
        login: i.user.login,
        avatarUrl: i.user.avatar_url,
      },
      labels: i.labels.map((l) => ({ name: l.name, color: l.color })),
      comments: i.comments,
      createdAt: i.created_at,
      updatedAt: i.updated_at,
      closedAt: i.closed_at,
      htmlUrl: i.html_url,
    }));

    res.json({
      success: true,
      count: formattedIssues.length,
      issues: formattedIssues,
    });
  } catch (error) {
    console.error("Error fetching issues:", error);
    res.status(error.status || 500).json({
      success: false,
      error: error.message,
    });
  }
});

// Repository languages breakdown
app.get("/api/github/repos/:owner/:repo/languages", async (req, res) => {
  const { owner, repo } = req.params;
  try {
    const data = await getRepoLanguages(owner, repo);
    const totalBytes = Object.values(data).reduce((sum, bytes) => sum + bytes, 0);

    const breakdown = Object.entries(data).map(([lang, bytes]) => ({
      language: lang,
      bytes,
      percentage: totalBytes > 0 ? Number(((bytes / totalBytes) * 100).toFixed(1)) : 0,
    }));

    res.json({
      success: true,
      totalBytes,
      languages: breakdown,
      raw: data,
    });
  } catch (error) {
    console.error("Error fetching languages:", error);
    res.status(error.status || 500).json({
      success: false,
      error: error.message,
    });
  }
});

// Repository contributors
app.get("/api/github/repos/:owner/:repo/contributors", async (req, res) => {
  const { owner, repo } = req.params;
  try {
    const contributors = await getRepoContributors(owner, repo);

    const formatted = contributors.map((c) => ({
      id: c.id,
      login: c.login,
      avatarUrl: c.avatar_url,
      htmlUrl: c.html_url,
      contributions: c.contributions,
      type: c.type,
    }));

    res.json({
      success: true,
      count: formatted.length,
      contributors: formatted,
    });
  } catch (error) {
    console.error("Error fetching contributors:", error);
    res.status(error.status || 500).json({
      success: false,
      error: error.message,
    });
  }
});

// Repository branches
app.get("/api/github/repos/:owner/:repo/branches", async (req, res) => {
  const { owner, repo } = req.params;
  try {
    const branches = await getRepoBranches(owner, repo);

    const formatted = branches.map((b) => ({
      name: b.name,
      commitSha: b.commit.sha,
      protected: b.protected,
    }));

    res.json({
      success: true,
      count: formatted.length,
      branches: formatted,
    });
  } catch (error) {
    console.error("Error fetching branches:", error);
    res.status(error.status || 500).json({
      success: false,
      error: error.message,
    });
  }
});

// User activity events / pulse feed
app.get("/api/github/events", async (req, res) => {
  const username = req.query.username || "deep-2105";
  try {
    const events = await getUserEvents(username, { per_page: 50 });

    const formattedEvents = events.map((e) => {
      let actionSummary;
      let detail = null;


      if (e.type === "PushEvent") {
        const commitCount = e.payload?.commits?.length || 0;
        const branch = e.payload?.ref ? e.payload.ref.replace("refs/heads/", "") : "branch";
        actionSummary = `Pushed ${commitCount} commit${commitCount === 1 ? "" : "s"} to ${branch}`;
        detail = {
          branch,
          commits: (e.payload?.commits || []).map((c) => ({
            sha: c.sha.substring(0, 7),
            message: c.message,
          })),
        };
      } else if (e.type === "PullRequestEvent") {
        actionSummary = `${e.payload?.action || "updated"} PR #${e.payload?.pull_request?.number}: ${e.payload?.pull_request?.title}`;
        detail = {
          action: e.payload?.action,
          prNumber: e.payload?.pull_request?.number,
          title: e.payload?.pull_request?.title,
          url: e.payload?.pull_request?.html_url,
        };
      } else if (e.type === "CreateEvent") {
        actionSummary = `Created ${e.payload?.ref_type || "resource"} ${e.payload?.ref || ""}`.trim();
        detail = {
          refType: e.payload?.ref_type,
          ref: e.payload?.ref,
          description: e.payload?.description,
        };
      } else if (e.type === "WatchEvent") {
        actionSummary = `Starred repository`;
      } else if (e.type === "IssuesEvent") {
        actionSummary = `${e.payload?.action || "updated"} issue #${e.payload?.issue?.number}: ${e.payload?.issue?.title}`;
        detail = {
          action: e.payload?.action,
          issueNumber: e.payload?.issue?.number,
          title: e.payload?.issue?.title,
        };
      } else {
        actionSummary = e.type.replace("Event", "");
      }

      return {
        id: e.id,
        type: e.type,
        actor: {
          login: e.actor.login,
          avatarUrl: e.actor.avatar_url,
        },
        repo: {
          name: e.repo.name,
        },
        actionSummary,
        detail,
        createdAt: e.created_at,
      };
    });

    res.json({
      success: true,
      count: formattedEvents.length,
      events: formattedEvents,
    });
  } catch (error) {
    console.error("Error fetching events:", error);
    res.status(error.status || 500).json({
      success: false,
      error: error.message,
    });
  }
});

// Developer pulse overview aggregation
const handleOverview = async (req, res) => {
  const username = req.params.username || req.query.username || "deep-2105";
  try {
    const [profile, repos, events] = await Promise.all([
      getUserProfile(username),
      getUserRepos(username, { per_page: 100 }),
      getUserEvents(username, { per_page: 50 }),
    ]);

    const totalStars = repos.reduce((sum, r) => sum + (r.stargazers_count || 0), 0);
    const totalForks = repos.reduce((sum, r) => sum + (r.forks_count || 0), 0);
    const totalOpenIssues = repos.reduce((sum, r) => sum + (r.open_issues_count || 0), 0);

    // Language statistics
    const languageCounts = {};
    repos.forEach((r) => {
      if (r.language) {
        languageCounts[r.language] = (languageCounts[r.language] || 0) + 1;
      }
    });

    // Activity breakdown by type
    const activityByType = {};
    events.forEach((e) => {
      activityByType[e.type] = (activityByType[e.type] || 0) + 1;
    });

    // Recent active repos
    const topRepos = [...repos]
      .sort((a, b) => (b.stargazers_count || 0) - (a.stargazers_count || 0) || new Date(b.pushed_at) - new Date(a.pushed_at))
      .slice(0, 6)
      .map((r) => ({
        name: r.name,
        fullName: r.full_name,
        stars: r.stargazers_count,
        forks: r.forks_count,
        language: r.language,
        pushedAt: r.pushed_at,
        description: r.description,
        private: r.private,
      }));

    res.json({
      success: true,
      user: {
        login: profile.login,
        name: profile.name || profile.login,
        avatarUrl: profile.avatar_url,
        bio: profile.bio,
        location: profile.location,
        followers: profile.followers,
        following: profile.following,
        publicRepos: profile.public_repos,
        htmlUrl: profile.html_url,
      },
      stats: {
        totalRepos: repos.length,
        totalStars,
        totalForks,
        totalOpenIssues,
        languageDistribution: languageCounts,
        activityByType,
      },
      topRepositories: topRepos,
      recentEventsCount: events.length,
    });
  } catch (error) {
    console.error("Error generating overview:", error);
    res.status(error.status || 500).json({
      success: false,
      error: error.message,
    });
  }
};

app.get("/api/github/overview", handleOverview);
app.get("/api/github/overview/:username", handleOverview);

app.listen(PORT, () => {
  console.log(`GitHub Pulse backend running at http://localhost:${PORT}`);
});


