import { useState } from "react";
import {
  Activity,
  RefreshCw,
  Search,
  Moon,
  Sun,
  ShieldCheck,
  ExternalLink,
} from "lucide-react";

export function Header({
  currentUser,
  userProfile,
  onUserChange,
  onRefresh,
  loading,
  darkMode,
  onToggleTheme,
}) {
  const [searchInput, setSearchInput] = useState("");

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchInput.trim()) {
      onUserChange(searchInput.trim());
    }
  };


  return (
    <header className="header-glass">
      <div className="header-left">
        <div className="brand-logo">
          <div className="pulse-icon-wrapper">
            <Activity className="pulse-svg" size={22} />
            <span className="pulse-ping"></span>
          </div>
          <div className="brand-text">
            <div className="brand-title-row">
              <span className="brand-name">GitHub Pulse</span>
              <span className="badge-live">LIVE</span>
            </div>
            <span className="brand-subtitle">Developer Intelligence Dashboard</span>
          </div>
        </div>

        <div className="app-badge" title="GitHub App Authenticated via RSA Private Key">
          <ShieldCheck size={14} className="app-badge-icon" />
          <span>App Auth Active</span>
          <span className="app-badge-dot"></span>
        </div>
      </div>

      <div className="header-right">
        {/* User Search Bar */}
        <form onSubmit={handleSearchSubmit} className="search-form">
          <div className="search-input-wrapper">
            <Search size={16} className="search-icon" />
            <input
              type="text"
              placeholder="Inspect user (e.g. deep-2105)..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="search-input"
            />
            {searchInput && (
              <button type="submit" className="search-btn">
                Go
              </button>
            )}
          </div>
        </form>

        {/* User Profile Pill */}
        {userProfile && (
          <a
            href={userProfile.htmlUrl || `https://github.com/${currentUser}`}
            target="_blank"
            rel="noreferrer"
            className="user-profile-pill"
            title="View on GitHub"
          >
            <img
              src={userProfile.avatarUrl || "https://github.com/github.png"}
              alt={userProfile.login}
              className="user-avatar"
            />
            <div className="user-info">
              <span className="user-name">{userProfile.name || userProfile.login}</span>
              <span className="user-login">@{userProfile.login}</span>
            </div>
            <ExternalLink size={12} className="user-ext-icon" />
          </a>
        )}

        {/* Refresh Button */}
        <button
          className={`btn-action ${loading ? "btn-loading" : ""}`}
          onClick={onRefresh}
          title="Refresh GitHub Data"
          disabled={loading}
        >
          <RefreshCw size={16} className={loading ? "spin-icon" : ""} />
        </button>

        {/* Theme Toggle */}
        <button
          className="btn-action"
          onClick={onToggleTheme}
          title={`Switch to ${darkMode ? "Light" : "Dark"} Mode`}
        >
          {darkMode ? <Sun size={16} /> : <Moon size={16} />}
        </button>
      </div>
    </header>
  );
}
