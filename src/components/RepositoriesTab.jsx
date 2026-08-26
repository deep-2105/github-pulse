import { useState, useMemo } from "react";
import {
  Search,
  Star,
  GitFork,
  AlertCircle,
  ExternalLink,
  BookMarked,
  Eye,
} from "lucide-react";
import { getLanguageColor } from "../utils/githubColors.js";
import { formatTimeAgo } from "../utils/helpers.js";

export function RepositoriesTab({ repositories = [], onSelectRepo }) {

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState("all");
  const [selectedType, setSelectedType] = useState("all");
  const [sortBy, setSortBy] = useState("pushed");

  // Extract unique languages from repositories
  const availableLanguages = useMemo(() => {
    const langs = new Set();
    repositories.forEach((r) => {
      if (r.language) langs.add(r.language);
    });
    return ["all", ...Array.from(langs)];
  }, [repositories]);

  // Filter & sort repositories
  const filteredRepos = useMemo(() => {
    return repositories
      .filter((repo) => {
        const matchesSearch =
          repo.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (repo.description && repo.description.toLowerCase().includes(searchTerm.toLowerCase()));

        const matchesLanguage =
          selectedLanguage === "all" || repo.language === selectedLanguage;

        const matchesType =
          selectedType === "all" ||
          (selectedType === "forks" && repo.fork) ||
          (selectedType === "sources" && !repo.fork);

        return matchesSearch && matchesLanguage && matchesType;
      })
      .sort((a, b) => {
        if (sortBy === "stars") {
          return (b.stars || 0) - (a.stars || 0);
        } else if (sortBy === "forks") {
          return (b.forks || 0) - (a.forks || 0);
        } else if (sortBy === "name") {
          return a.name.localeCompare(b.name);
        } else {
          // default: recently pushed
          return new Date(b.pushedAt || 0) - new Date(a.pushedAt || 0);
        }
      });
  }, [repositories, searchTerm, selectedLanguage, selectedType, sortBy]);

  return (
    <div className="tab-pane repos-pane">
      {/* Search & Filter Controls */}
      <div className="repo-filters-bar">
        <div className="search-box">
          <Search size={16} className="search-icon" />
          <input
            type="text"
            placeholder="Search repositories by name or keyword..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="filter-input"
          />
          {searchTerm && (
            <button className="clear-btn" onClick={() => setSearchTerm("")}>
              ✕
            </button>
          )}
        </div>

        <div className="filter-dropdowns">
          {/* Language Filter */}
          <div className="select-wrapper">
            <select
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value)}
              className="filter-select"
            >
              <option value="all">Language: All</option>
              {availableLanguages
                .filter((l) => l !== "all")
                .map((lang) => (
                  <option key={lang} value={lang}>
                    {lang}
                  </option>
                ))}
            </select>
          </div>

          {/* Type Filter */}
          <div className="select-wrapper">
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="filter-select"
            >
              <option value="all">Type: All</option>
              <option value="sources">Sources only</option>
              <option value="forks">Forks only</option>
            </select>
          </div>

          {/* Sort By */}
          <div className="select-wrapper">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="filter-select"
            >
              <option value="pushed">Sort: Recently Updated</option>
              <option value="stars">Sort: Most Stars</option>
              <option value="forks">Sort: Most Forks</option>
              <option value="name">Sort: Name (A-Z)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Results Header */}
      <div className="repos-meta-header">
        <span className="results-count">
          Showing <strong>{filteredRepos.length}</strong> of {repositories.length} repositories
        </span>
      </div>

      {/* Repositories Grid */}
      {filteredRepos.length > 0 ? (
        <div className="repos-grid">
          {filteredRepos.map((repo) => (
            <div key={repo.id} className="repo-card">
              <div className="repo-card-top">
                <div className="repo-card-header">
                  <div className="repo-card-title-group">
                    <BookMarked size={16} className="repo-icon" />
                    <h3
                      className="repo-title"
                      onClick={() => onSelectRepo(repo.name)}
                      title="Inspect this repository"
                    >
                      {repo.name}
                    </h3>
                  </div>

                  <div className="repo-badges">
                    <span className={`badge-visibility ${repo.private ? "badge-private" : "badge-public"}`}>
                      {repo.private ? "Private" : "Public"}
                    </span>
                    {repo.fork && <span className="badge-fork">Fork</span>}
                  </div>
                </div>

                <p className="repo-card-desc">
                  {repo.description || "No description provided for this repository."}
                </p>
              </div>

              <div className="repo-card-bottom">
                <div className="repo-stats-row">
                  {repo.language && (
                    <span className="repo-stat-lang">
                      <span
                        className="lang-dot-small"
                        style={{ backgroundColor: getLanguageColor(repo.language) }}
                      ></span>
                      {repo.language}
                    </span>
                  )}

                  <span className="repo-stat-item">
                    <Star size={13} /> {repo.stars}
                  </span>

                  <span className="repo-stat-item">
                    <GitFork size={13} /> {repo.forks}
                  </span>

                  {repo.openIssues > 0 && (
                    <span className="repo-stat-item repo-issues-warn">
                      <AlertCircle size={13} /> {repo.openIssues}
                    </span>
                  )}
                </div>

                <div className="repo-card-actions">
                  <span className="repo-updated-text">
                    Updated {formatTimeAgo(repo.pushedAt)}
                  </span>

                  <div className="repo-btn-group">
                    <button
                      className="btn-inspect"
                      onClick={() => onSelectRepo(repo.name)}
                    >
                      <Eye size={13} /> Inspect
                    </button>
                    <a
                      href={repo.htmlUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="btn-icon-ext"
                      title="Open on GitHub"
                    >
                      <ExternalLink size={13} />
                    </a>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="empty-results-card">
          <BookMarked size={36} className="empty-icon" />
          <h4>No repositories match your criteria</h4>
          <p>Try adjusting your search terms or filter selections.</p>
          <button
            className="btn-secondary"
            onClick={() => {
              setSearchTerm("");
              setSelectedLanguage("all");
              setSelectedType("all");
            }}
          >
            Reset Filters
          </button>
        </div>
      )}
    </div>
  );
}
