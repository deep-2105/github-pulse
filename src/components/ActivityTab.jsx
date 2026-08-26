import { useState } from "react";
import {
  Activity,
  GitCommit,
  GitPullRequest,
  PlusCircle,
  Star,
  AlertCircle,
  GitFork,
  ExternalLink,
  BookMarked,
  Clock,
} from "lucide-react";
import { formatTimeAgo, formatDate } from "../utils/helpers.js";


export function ActivityTab({ events = [], onSelectRepo }) {
  const [filterType, setFilterType] = useState("all");

  const filteredEvents = events.filter((e) => {
    if (filterType === "all") return true;
    if (filterType === "push") return e.type === "PushEvent";
    if (filterType === "pull_request") return e.type === "PullRequestEvent";
    if (filterType === "create") return e.type === "CreateEvent";
    if (filterType === "watch") return e.type === "WatchEvent";
    if (filterType === "issues") return e.type === "IssuesEvent";
    return true;
  });

  const getEventIcon = (type) => {
    switch (type) {
      case "PushEvent":
        return <GitCommit size={16} className="event-type-icon push-color" />;
      case "PullRequestEvent":
        return <GitPullRequest size={16} className="event-type-icon pr-color" />;
      case "CreateEvent":
        return <PlusCircle size={16} className="event-type-icon create-color" />;
      case "WatchEvent":
        return <Star size={16} className="event-type-icon star-color" />;
      case "IssuesEvent":
        return <AlertCircle size={16} className="event-type-icon issue-color" />;
      case "ForkEvent":
        return <GitFork size={16} className="event-type-icon fork-color" />;
      default:
        return <Activity size={16} className="event-type-icon default-color" />;
    }
  };

  const getRepoShortName = (fullName) => {
    if (!fullName) return "";
    const parts = fullName.split("/");
    return parts.length > 1 ? parts[1] : fullName;
  };

  return (
    <div className="tab-pane activity-pane">
      {/* Filters Bar */}
      <div className="activity-filters-bar">
        <div className="activity-filter-pills">
          <button
            className={`filter-pill ${filterType === "all" ? "active" : ""}`}
            onClick={() => setFilterType("all")}
          >
            All Activity ({events.length})
          </button>
          <button
            className={`filter-pill ${filterType === "push" ? "active" : ""}`}
            onClick={() => setFilterType("push")}
          >
            Pushes ({events.filter((e) => e.type === "PushEvent").length})
          </button>
          <button
            className={`filter-pill ${filterType === "pull_request" ? "active" : ""}`}
            onClick={() => setFilterType("pull_request")}
          >
            Pull Requests ({events.filter((e) => e.type === "PullRequestEvent").length})
          </button>
          <button
            className={`filter-pill ${filterType === "create" ? "active" : ""}`}
            onClick={() => setFilterType("create")}
          >
            Creates ({events.filter((e) => e.type === "CreateEvent").length})
          </button>
          <button
            className={`filter-pill ${filterType === "watch" ? "active" : ""}`}
            onClick={() => setFilterType("watch")}
          >
            Stars ({events.filter((e) => e.type === "WatchEvent").length})
          </button>
          <button
            className={`filter-pill ${filterType === "issues" ? "active" : ""}`}
            onClick={() => setFilterType("issues")}
          >
            Issues ({events.filter((e) => e.type === "IssuesEvent").length})
          </button>
        </div>
      </div>

      {/* Activity Timeline List */}
      {filteredEvents.length > 0 ? (
        <div className="activity-timeline">
          {filteredEvents.map((e) => (
            <div key={e.id} className="timeline-item">
              <div className="timeline-icon-wrap">
                {getEventIcon(e.type)}
                <div className="timeline-line"></div>
              </div>

              <div className="timeline-card">
                <div className="timeline-card-header">
                  <div className="timeline-actor-row">
                    <img
                      src={e.actor?.avatarUrl}
                      alt={e.actor?.login}
                      className="timeline-actor-avatar"
                    />
                    <span className="timeline-actor-name">
                      <strong>@{e.actor?.login}</strong>
                    </span>
                    <span className="timeline-action-summary">{e.actionSummary}</span>
                  </div>

                  <span className="timeline-time" title={formatDate(e.createdAt)}>
                    <Clock size={12} /> {formatTimeAgo(e.createdAt)}
                  </span>
                </div>

                <div className="timeline-card-body">
                  <div className="timeline-repo-tag">
                    <BookMarked size={13} />
                    <span
                      className="repo-click-link"
                      onClick={() => onSelectRepo(getRepoShortName(e.repo?.name))}
                      title="Inspect this repository"
                    >
                      {e.repo?.name}
                    </span>
                  </div>

                  {/* Commits detail */}
                  {e.type === "PushEvent" && e.detail?.commits?.length > 0 && (
                    <div className="timeline-commits-box">
                      {e.detail.commits.map((c, i) => (
                        <div key={i} className="timeline-commit-row">
                          <code className="commit-sha">{c.sha}</code>
                          <span className="commit-msg">{c.message}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* PR Detail */}
                  {e.type === "PullRequestEvent" && e.detail && (
                    <div className="timeline-pr-box">
                      {e.detail.url ? (
                        <a
                          href={e.detail.url}
                          target="_blank"
                          rel="noreferrer"
                          className="timeline-pr-link"
                        >
                          #{e.detail.prNumber}: {e.detail.title} <ExternalLink size={12} />
                        </a>
                      ) : (
                        <span>#{e.detail.prNumber}: {e.detail.title}</span>
                      )}
                    </div>
                  )}

                  {/* Create Resource Detail */}
                  {e.type === "CreateEvent" && e.detail && (
                    <div className="timeline-create-box">
                      <span>Type: <strong>{e.detail.refType}</strong> {e.detail.ref ? `(${e.detail.ref})` : ""}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="empty-results-card">
          <Activity size={36} className="empty-icon" />
          <h4>No activity events found for this filter</h4>
          <p>Try selecting 'All Activity' to see recent developer events.</p>
        </div>
      )}
    </div>
  );
}
