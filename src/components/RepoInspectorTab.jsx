import { useState, useEffect, useCallback } from "react";
import {
  BookMarked,
  GitCommit,
  GitPullRequest,
  AlertCircle,
  Code2,
  Users,
  GitBranch,
  Star,
  GitFork,
  Eye,
  ExternalLink,
  Scale,
  MessageSquare,
} from "lucide-react";
import {
  fetchRepoDetails,
  fetchRepoCommits,
  fetchRepoPulls,
  fetchRepoIssues,
  fetchRepoLanguages,
  fetchRepoContributors,
  fetchRepoBranches,
} from "../services/api.js";
import { getLanguageColor } from "../utils/githubColors.js";
import { formatTimeAgo, formatDate, formatBytes } from "../utils/helpers.js";
import { LoadingSpinner, ErrorState } from "./LoadingSpinner.jsx";

export function RepoInspectorTab({
  selectedRepoName,
  repositories = [],
  owner = "deep-2105",
  onSelectRepo,
}) {
  const currentRepo = selectedRepoName || (repositories[0]?.name) || "github-pulse";
  const [subTab, setSubTab] = useState("commits");

  // Data states
  const [repoDetails, setRepoDetails] = useState(null);
  const [commits, setCommits] = useState([]);
  const [pulls, setPulls] = useState([]);
  const [issues, setIssues] = useState([]);
  const [languages, setLanguages] = useState(null);
  const [contributors, setContributors] = useState([]);
  const [branches, setBranches] = useState([]);

  // Filter states
  const [prFilter, setPrFilter] = useState("all");
  const [issueFilter, setIssueFilter] = useState("all");

  // Loading & Error states
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load all repository data
  const loadRepoData = useCallback(async (repoName) => {
    setLoading(true);
    setError(null);
    try {
      const [
        detailsRes,
        commitsRes,
        pullsRes,
        issuesRes,
        languagesRes,
        contribsRes,
        branchesRes,
      ] = await Promise.allSettled([
        fetchRepoDetails(owner, repoName),
        fetchRepoCommits(owner, repoName),
        fetchRepoPulls(owner, repoName),
        fetchRepoIssues(owner, repoName),
        fetchRepoLanguages(owner, repoName),
        fetchRepoContributors(owner, repoName),
        fetchRepoBranches(owner, repoName),
      ]);

      if (detailsRes.status === "fulfilled" && detailsRes.value.success) {
        setRepoDetails(detailsRes.value.repository);
      } else {
        throw new Error(detailsRes.reason?.message || "Failed to load repository details");
      }

      setCommits(commitsRes.status === "fulfilled" && commitsRes.value.success ? commitsRes.value.commits : []);
      setPulls(pullsRes.status === "fulfilled" && pullsRes.value.success ? pullsRes.value.pullRequests : []);
      setIssues(issuesRes.status === "fulfilled" && issuesRes.value.success ? issuesRes.value.issues : []);
      setLanguages(languagesRes.status === "fulfilled" && languagesRes.value.success ? languagesRes.value : null);
      setContributors(contribsRes.status === "fulfilled" && contribsRes.value.success ? contribsRes.value.contributors : []);
      setBranches(branchesRes.status === "fulfilled" && branchesRes.value.success ? branchesRes.value.branches : []);
    } catch (err) {
      console.error("Error loading repo details:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [owner]);

  useEffect(() => {
    if (currentRepo) {
      loadRepoData(currentRepo);
    }
  }, [currentRepo, loadRepoData]);

  const handleRepoDropdownChange = (e) => {
    const newRepo = e.target.value;
    if (onSelectRepo) onSelectRepo(newRepo);
  };


  const filteredPulls = pulls.filter((p) => {
    if (prFilter === "open") return p.state === "open";
    if (prFilter === "closed") return p.state === "closed" && !p.mergedAt;
    if (prFilter === "merged") return !!p.mergedAt;
    return true;
  });

  const filteredIssues = issues.filter((i) => {
    if (issueFilter === "open") return i.state === "open";
    if (issueFilter === "closed") return i.state === "closed";
    return true;
  });

  return (
    <div className="tab-pane inspector-pane">
      {/* Top Repo Selector & Switcher Bar */}
      <div className="inspector-top-bar">
        <div className="repo-breadcrumb">
          <BookMarked size={18} className="breadcrumb-icon" />
          <span className="breadcrumb-owner">{owner}</span>
          <span className="breadcrumb-separator">/</span>
          <div className="repo-select-container">
            <select
              value={currentRepo}
              onChange={handleRepoDropdownChange}
              className="inspector-repo-select"
            >
              {repositories.length > 0 ? (
                repositories.map((r) => (
                  <option key={r.name} value={r.name}>
                    {r.name} {r.stars ? `(★ ${r.stars})` : ""}
                  </option>
                ))
              ) : (
                <option value={currentRepo}>{currentRepo}</option>
              )}
            </select>
          </div>
        </div>

        {repoDetails && (
          <a
            href={repoDetails.htmlUrl}
            target="_blank"
            rel="noreferrer"
            className="btn-github-view"
          >
            Open on GitHub <ExternalLink size={13} />
          </a>
        )}
      </div>

      {loading ? (
        <LoadingSpinner message={`Inspecting ${owner}/${currentRepo}...`} />
      ) : error ? (
        <ErrorState
          title={`Could not load ${owner}/${currentRepo}`}
          message={error}
          onRetry={() => loadRepoData(currentRepo)}
        />
      ) : repoDetails ? (
        <>
          {/* Repository Header Hero Banner */}
          <div className="repo-hero-banner">
            <div className="repo-hero-main">
              <div className="repo-hero-title-row">
                <h2 className="repo-hero-title">{repoDetails.name}</h2>
                <span className={`badge-visibility ${repoDetails.private ? "badge-private" : "badge-public"}`}>
                  {repoDetails.private ? "Private" : "Public"}
                </span>
                {repoDetails.defaultBranch && (
                  <span className="badge-branch">
                    <GitBranch size={12} /> {repoDetails.defaultBranch}
                  </span>
                )}
                {repoDetails.license && (
                  <span className="badge-license">
                    <Scale size={12} /> {repoDetails.license}
                  </span>
                )}
              </div>

              <p className="repo-hero-description">
                {repoDetails.description || "No description provided for this repository."}
              </p>

              {repoDetails.topics && repoDetails.topics.length > 0 && (
                <div className="repo-topics-list">
                  {repoDetails.topics.map((t) => (
                    <span key={t} className="topic-pill">
                      #{t}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Quick Stats Grid */}
            <div className="repo-hero-stats">
              <div className="hero-stat-box">
                <Star size={16} className="stat-icon-yellow" />
                <span className="stat-value">{repoDetails.stars}</span>
                <span className="stat-label">Stars</span>
              </div>
              <div className="hero-stat-box">
                <GitFork size={16} className="stat-icon-purple" />
                <span className="stat-value">{repoDetails.forks}</span>
                <span className="stat-label">Forks</span>
              </div>
              <div className="hero-stat-box">
                <Eye size={16} className="stat-icon-blue" />
                <span className="stat-value">{repoDetails.watchers}</span>
                <span className="stat-label">Watchers</span>
              </div>
              <div className="hero-stat-box">
                <AlertCircle size={16} className="stat-icon-red" />
                <span className="stat-value">{repoDetails.openIssues}</span>
                <span className="stat-label">Open Issues</span>
              </div>
            </div>
          </div>

          {/* Sub-Navigation Tabs */}
          <div className="subtabs-bar">
            <button
              className={`subtab-btn ${subTab === "commits" ? "subtab-active" : ""}`}
              onClick={() => setSubTab("commits")}
            >
              <GitCommit size={15} />
              <span>Commits</span>
              <span className="subtab-count">{commits.length}</span>
            </button>

            <button
              className={`subtab-btn ${subTab === "pulls" ? "subtab-active" : ""}`}
              onClick={() => setSubTab("pulls")}
            >
              <GitPullRequest size={15} />
              <span>Pull Requests</span>
              <span className="subtab-count">{pulls.length}</span>
            </button>

            <button
              className={`subtab-btn ${subTab === "issues" ? "subtab-active" : ""}`}
              onClick={() => setSubTab("issues")}
            >
              <AlertCircle size={15} />
              <span>Issues</span>
              <span className="subtab-count">{issues.length}</span>
            </button>

            <button
              className={`subtab-btn ${subTab === "languages" ? "subtab-active" : ""}`}
              onClick={() => setSubTab("languages")}
            >
              <Code2 size={15} />
              <span>Languages</span>
              <span className="subtab-count">{languages?.languages?.length || 0}</span>
            </button>

            <button
              className={`subtab-btn ${subTab === "contributors" ? "subtab-active" : ""}`}
              onClick={() => setSubTab("contributors")}
            >
              <Users size={15} />
              <span>Contributors</span>
              <span className="subtab-count">{contributors.length}</span>
            </button>

            <button
              className={`subtab-btn ${subTab === "branches" ? "subtab-active" : ""}`}
              onClick={() => setSubTab("branches")}
            >
              <GitBranch size={15} />
              <span>Branches</span>
              <span className="subtab-count">{branches.length}</span>
            </button>
          </div>

          {/* SubTab Contents */}
          <div className="subtab-content-area">
            {/* COMMITS SUBTAB */}
            {subTab === "commits" && (
              <div className="commits-view">
                {commits.length > 0 ? (
                  <div className="commits-list">
                    {commits.map((c) => (
                      <div key={c.sha} className="commit-item">
                        <div className="commit-avatar-col">
                          {c.author?.avatarUrl ? (
                            <img
                              src={c.author.avatarUrl}
                              alt={c.author.login}
                              className="commit-avatar"
                            />
                          ) : (
                            <div className="commit-avatar-placeholder">
                              {c.author?.name?.charAt(0) || "U"}
                            </div>
                          )}
                        </div>

                        <div className="commit-info-col">
                          <div className="commit-msg-row">
                            <span className="commit-message">{c.message}</span>
                          </div>
                          <div className="commit-meta-row">
                            <span className="commit-author">
                              <strong>{c.author?.login || c.author?.name}</strong> committed {formatTimeAgo(c.author?.date)}
                            </span>
                            <span className="commit-date-exact">
                              ({formatDate(c.author?.date)})
                            </span>
                          </div>
                        </div>

                        <div className="commit-actions-col">
                          <a
                            href={c.htmlUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="commit-sha-pill"
                            title="View commit on GitHub"
                          >
                            <code>{c.shortSha}</code>
                            <ExternalLink size={11} />
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="empty-subtab-card">
                    <GitCommit size={32} />
                    <p>No commits recorded on this branch yet.</p>
                  </div>
                )}
              </div>
            )}

            {/* PULL REQUESTS SUBTAB */}
            {subTab === "pulls" && (
              <div className="pulls-view">
                <div className="filter-pill-row">
                  <button
                    className={`filter-pill ${prFilter === "all" ? "active" : ""}`}
                    onClick={() => setPrFilter("all")}
                  >
                    All ({pulls.length})
                  </button>
                  <button
                    className={`filter-pill ${prFilter === "open" ? "active" : ""}`}
                    onClick={() => setPrFilter("open")}
                  >
                    Open ({pulls.filter((p) => p.state === "open").length})
                  </button>
                  <button
                    className={`filter-pill ${prFilter === "merged" ? "active" : ""}`}
                    onClick={() => setPrFilter("merged")}
                  >
                    Merged ({pulls.filter((p) => !!p.mergedAt).length})
                  </button>
                  <button
                    className={`filter-pill ${prFilter === "closed" ? "active" : ""}`}
                    onClick={() => setPrFilter("closed")}
                  >
                    Closed ({pulls.filter((p) => p.state === "closed" && !p.mergedAt).length})
                  </button>
                </div>

                {filteredPulls.length > 0 ? (
                  <div className="pulls-list">
                    {filteredPulls.map((pr) => (
                      <div key={pr.id} className="pr-item">
                        <div className="pr-status-col">
                          {pr.mergedAt ? (
                            <span className="badge-pr badge-merged" title="Merged">
                              Merged
                            </span>
                          ) : pr.state === "open" ? (
                            <span className="badge-pr badge-open" title="Open">
                              Open
                            </span>
                          ) : (
                            <span className="badge-pr badge-closed" title="Closed">
                              Closed
                            </span>
                          )}
                        </div>

                        <div className="pr-info-col">
                          <div className="pr-title-row">
                            <a
                              href={pr.htmlUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="pr-title"
                            >
                              {pr.title}
                            </a>
                            <span className="pr-number">#{pr.number}</span>
                          </div>

                          <div className="pr-meta-row">
                            <span>Opened by <strong>{pr.user.login}</strong> {formatTimeAgo(pr.createdAt)}</span>
                            {pr.labels?.map((l) => (
                              <span
                                key={l.name}
                                className="label-tag"
                                style={{
                                  backgroundColor: `#${l.color}20`,
                                  color: `#${l.color}`,
                                  borderColor: `#${l.color}50`,
                                }}
                              >
                                {l.name}
                              </span>
                            ))}
                          </div>
                        </div>

                        <a
                          href={pr.htmlUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="btn-icon-ext"
                        >
                          <ExternalLink size={13} />
                        </a>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="empty-subtab-card">
                    <GitPullRequest size={32} />
                    <p>No pull requests match the current filter.</p>
                  </div>
                )}
              </div>
            )}

            {/* ISSUES SUBTAB */}
            {subTab === "issues" && (
              <div className="issues-view">
                <div className="filter-pill-row">
                  <button
                    className={`filter-pill ${issueFilter === "all" ? "active" : ""}`}
                    onClick={() => setIssueFilter("all")}
                  >
                    All ({issues.length})
                  </button>
                  <button
                    className={`filter-pill ${issueFilter === "open" ? "active" : ""}`}
                    onClick={() => setIssueFilter("open")}
                  >
                    Open ({issues.filter((i) => i.state === "open").length})
                  </button>
                  <button
                    className={`filter-pill ${issueFilter === "closed" ? "active" : ""}`}
                    onClick={() => setIssueFilter("closed")}
                  >
                    Closed ({issues.filter((i) => i.state === "closed").length})
                  </button>
                </div>

                {filteredIssues.length > 0 ? (
                  <div className="issues-list">
                    {filteredIssues.map((issue) => (
                      <div key={issue.id} className="issue-item">
                        <div className="issue-status-col">
                          {issue.state === "open" ? (
                            <span className="badge-issue badge-open">Open</span>
                          ) : (
                            <span className="badge-issue badge-closed">Closed</span>
                          )}
                        </div>

                        <div className="issue-info-col">
                          <div className="issue-title-row">
                            <a
                              href={issue.htmlUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="issue-title"
                            >
                              {issue.title}
                            </a>
                            <span className="issue-number">#{issue.number}</span>
                          </div>

                          <div className="issue-meta-row">
                            <span>Opened by <strong>{issue.user.login}</strong> {formatTimeAgo(issue.createdAt)}</span>
                            {issue.labels?.map((l) => (
                              <span
                                key={l.name}
                                className="label-tag"
                                style={{
                                  backgroundColor: `#${l.color}20`,
                                  color: `#${l.color}`,
                                  borderColor: `#${l.color}50`,
                                }}
                              >
                                {l.name}
                              </span>
                            ))}
                            {issue.comments > 0 && (
                              <span className="issue-comments-tag">
                                <MessageSquare size={11} /> {issue.comments}
                              </span>
                            )}
                          </div>
                        </div>

                        <a
                          href={issue.htmlUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="btn-icon-ext"
                        >
                          <ExternalLink size={13} />
                        </a>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="empty-subtab-card">
                    <AlertCircle size={32} />
                    <p>No issues match the current filter.</p>
                  </div>
                )}
              </div>
            )}

            {/* LANGUAGES SUBTAB */}
            {subTab === "languages" && (
              <div className="languages-view">
                {languages && languages.languages?.length > 0 ? (
                  <div className="languages-detail-card">
                    {/* Visual Segmented Progress Bar */}
                    <div className="lang-bar-lg">
                      {languages.languages.map((l) => (
                        <div
                          key={l.language}
                          className="lang-segment-lg"
                          style={{
                            width: `${l.percentage}%`,
                            backgroundColor: getLanguageColor(l.language),
                          }}
                          title={`${l.language}: ${l.percentage}% (${formatBytes(l.bytes)})`}
                        ></div>
                      ))}
                    </div>

                    <div className="languages-table">
                      <div className="lang-table-header">
                        <span>Language</span>
                        <span>Share</span>
                        <span>Code Size</span>
                      </div>
                      {languages.languages.map((l) => (
                        <div key={l.language} className="lang-table-row">
                          <div className="lang-cell-name">
                            <span
                              className="lang-dot"
                              style={{ backgroundColor: getLanguageColor(l.language) }}
                            ></span>
                            <strong>{l.language}</strong>
                          </div>
                          <div className="lang-cell-percent">
                            <span className="percent-val">{l.percentage}%</span>
                          </div>
                          <div className="lang-cell-bytes">
                            <code>{formatBytes(l.bytes)}</code>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="empty-subtab-card">
                    <Code2 size={32} />
                    <p>No language breakdown data for this repository.</p>
                  </div>
                )}
              </div>
            )}

            {/* CONTRIBUTORS SUBTAB */}
            {subTab === "contributors" && (
              <div className="contributors-view">
                {contributors.length > 0 ? (
                  <div className="contributors-grid">
                    {contributors.map((c, index) => (
                      <a
                        key={c.id}
                        href={c.htmlUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="contributor-card"
                      >
                        <div className="contributor-rank">#{index + 1}</div>
                        <img
                          src={c.avatarUrl}
                          alt={c.login}
                          className="contributor-avatar"
                        />
                        <div className="contributor-info">
                          <span className="contributor-login">@{c.login}</span>
                          <span className="contributor-commits">
                            <strong>{c.contributions}</strong> commits
                          </span>
                        </div>
                        <ExternalLink size={12} className="contrib-ext" />
                      </a>
                    ))}
                  </div>
                ) : (
                  <div className="empty-subtab-card">
                    <Users size={32} />
                    <p>No contributors data available.</p>
                  </div>
                )}
              </div>
            )}

            {/* BRANCHES SUBTAB */}
            {subTab === "branches" && (
              <div className="branches-view">
                {branches.length > 0 ? (
                  <div className="branches-list">
                    {branches.map((b) => (
                      <div key={b.name} className="branch-item">
                        <div className="branch-left">
                          <GitBranch size={16} className="branch-icon" />
                          <span className="branch-name">{b.name}</span>
                          {b.name === repoDetails.defaultBranch && (
                            <span className="badge-default-branch">default</span>
                          )}
                          {b.protected && (
                            <span className="badge-protected">Protected</span>
                          )}
                        </div>

                        <div className="branch-right">
                          <span className="branch-sha">
                            <code>{b.commitSha.substring(0, 7)}</code>
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="empty-subtab-card">
                    <GitBranch size={32} />
                    <p>No branches recorded for this repository.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </>
      ) : null}
    </div>
  );
}
