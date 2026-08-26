import {
  BookMarked,
  Star,
  GitFork,
  AlertCircle,
  Activity,
  MapPin,
  Building,
  Users,
  ExternalLink,
  Flame,
  ArrowRight,
  Code2,
} from "lucide-react";
import { StatCard } from "./StatCard.jsx";
import { getLanguageColor } from "../utils/githubColors.js";
import { formatNumber, formatTimeAgo, calculatePulseScore } from "../utils/helpers.js";

export function OverviewTab({ overviewData, onSelectRepo, onSwitchTab }) {
  if (!overviewData) return null;

  const { user, stats, topRepositories } = overviewData;
  const pulse = calculatePulseScore(stats);


  // Calculate language distribution percentages
  const totalLangCount = Object.values(stats?.languageDistribution || {}).reduce((a, b) => a + b, 0);
  const languageList = Object.entries(stats?.languageDistribution || {})
    .map(([name, count]) => ({
      name,
      count,
      percentage: totalLangCount > 0 ? Number(((count / totalLangCount) * 100).toFixed(1)) : 0,
      color: getLanguageColor(name),
    }))
    .sort((a, b) => b.count - a.count);

  return (
    <div className="tab-pane overview-pane">
      {/* Top Profile & Scorecard Banner */}
      <div className="profile-hero-card">
        <div className="profile-hero-left">
          <img
            src={user.avatarUrl || "https://github.com/github.png"}
            alt={user.login}
            className="hero-avatar"
          />
          <div className="hero-details">
            <div className="hero-name-row">
              <h2 className="hero-name">{user.name || user.login}</h2>
              <a
                href={user.htmlUrl}
                target="_blank"
                rel="noreferrer"
                className="hero-github-link"
              >
                @{user.login} <ExternalLink size={13} />
              </a>
            </div>

            {user.bio && <p className="hero-bio">{user.bio}</p>}

            <div className="hero-meta-tags">
              {user.location && (
                <span className="hero-meta-item">
                  <MapPin size={13} /> {user.location}
                </span>
              )}
              {user.company && (
                <span className="hero-meta-item">
                  <Building size={13} /> {user.company}
                </span>
              )}
              <span className="hero-meta-item">
                <Users size={13} /> {user.followers} followers • {user.following} following
              </span>
            </div>
          </div>
        </div>

        {/* Pulse Score Meter */}
        <div className="pulse-score-card">
          <div className="pulse-score-header">
            <div className="pulse-score-title">
              <Flame size={16} className="flame-icon" />
              <span>Developer Pulse</span>
            </div>
            <span className="pulse-grade-badge">{pulse.grade}</span>
          </div>

          <div className="pulse-score-body">
            <div className="pulse-score-number">{pulse.score}</div>
            <div className="pulse-score-scale">/100</div>
          </div>

          <div className="pulse-meter-track">
            <div
              className="pulse-meter-fill"
              style={{ width: `${pulse.score}%` }}
            ></div>
          </div>

          <div className="pulse-score-footer">
            <span>Status: <strong>{pulse.label}</strong></span>
            <span>Live Sync</span>
          </div>
        </div>
      </div>

      {/* Primary Metrics Grid */}
      <div className="stats-grid">
        <StatCard
          title="Repositories"
          value={formatNumber(stats?.totalRepos || 0)}
          subtitle="Total accessible repositories"
          icon={BookMarked}
          accentColor="#58a6ff"
          onClick={() => onSwitchTab("repositories")}
        />
        <StatCard
          title="Total Stars"
          value={formatNumber(stats?.totalStars || 0)}
          subtitle="Earned across all projects"
          icon={Star}
          accentColor="#e3b341"
        />
        <StatCard
          title="Total Forks"
          value={formatNumber(stats?.totalForks || 0)}
          subtitle="Community forks created"
          icon={GitFork}
          accentColor="#bc8cff"
        />
        <StatCard
          title="Open Issues"
          value={formatNumber(stats?.totalOpenIssues || 0)}
          subtitle="Active tracks across repos"
          icon={AlertCircle}
          accentColor="#f85149"
        />
      </div>

      {/* Language Distribution & Top Repos Split */}
      <div className="overview-split-row">
        {/* Language Breakdown */}
        <div className="card-panel">
          <div className="card-panel-header">
            <div className="card-panel-title">
              <Code2 size={18} />
              <span>Language Ecosystem</span>
            </div>
            <span className="panel-badge">{languageList.length} Languages</span>
          </div>

          {languageList.length > 0 ? (
            <div className="language-ecosystem-body">
              {/* Stacked Progress Bar */}
              <div className="language-bar-stacked">
                {languageList.map((lang) => (
                  <div
                    key={lang.name}
                    className="lang-segment"
                    style={{
                      width: `${lang.percentage}%`,
                      backgroundColor: lang.color,
                    }}
                    title={`${lang.name}: ${lang.percentage}% (${lang.count} repos)`}
                  ></div>
                ))}
              </div>

              {/* Language Pills List */}
              <div className="language-legend-grid">
                {languageList.map((lang) => (
                  <div key={lang.name} className="lang-legend-item">
                    <span
                      className="lang-dot"
                      style={{ backgroundColor: lang.color }}
                    ></span>
                    <span className="lang-name">{lang.name}</span>
                    <span className="lang-percent">{lang.percentage}%</span>
                    <span className="lang-count">({lang.count} repos)</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p className="empty-subtext">No language data available</p>
          )}
        </div>

        {/* Top Active Repositories */}
        <div className="card-panel">
          <div className="card-panel-header">
            <div className="card-panel-title">
              <Activity size={18} />
              <span>Highlighted Projects</span>
            </div>
            <button
              className="btn-link"
              onClick={() => onSwitchTab("repositories")}
            >
              View All ({stats?.totalRepos || 0}) <ArrowRight size={13} />
            </button>
          </div>

          <div className="top-repos-list">
            {topRepositories?.map((repo) => (
              <div
                key={repo.fullName}
                className="top-repo-card"
                onClick={() => onSelectRepo(repo.name)}
              >
                <div className="top-repo-main">
                  <div className="top-repo-header">
                    <span className="top-repo-name">{repo.name}</span>
                    {repo.language && (
                      <span
                        className="repo-lang-badge"
                        style={{
                          backgroundColor: `${getLanguageColor(repo.language)}18`,
                          color: getLanguageColor(repo.language),
                          borderColor: `${getLanguageColor(repo.language)}40`,
                        }}
                      >
                        <span
                          className="lang-dot-small"
                          style={{ backgroundColor: getLanguageColor(repo.language) }}
                        ></span>
                        {repo.language}
                      </span>
                    )}
                  </div>
                  {repo.description && (
                    <p className="top-repo-desc">{repo.description}</p>
                  )}
                </div>

                <div className="top-repo-meta">
                  <span className="meta-stat">
                    <Star size={13} /> {repo.stars}
                  </span>
                  <span className="meta-stat">
                    <GitFork size={13} /> {repo.forks}
                  </span>
                  <span className="meta-time">Updated {formatTimeAgo(repo.pushedAt)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
