import { useState, useEffect, useCallback } from 'react'
import {
  LayoutDashboard,
  BookMarked,
  Layers,
  Activity,
  ExternalLink,
} from 'lucide-react'

import './App.css'
import { Header } from './components/Header.jsx'
import { OverviewTab } from './components/OverviewTab.jsx'
import { RepositoriesTab } from './components/RepositoriesTab.jsx'
import { RepoInspectorTab } from './components/RepoInspectorTab.jsx'
import { ActivityTab } from './components/ActivityTab.jsx'
import { LoadingSpinner, ErrorState } from './components/LoadingSpinner.jsx'
import {
  fetchOverview,
  fetchUserRepos,
  fetchEvents,
  fetchUserProfile,
} from './services/api.js'

function App() {
  const [currentUser, setCurrentUser] = useState('deep-2105')
  const [activeTab, setActiveTab] = useState('overview')
  const [selectedRepo, setSelectedRepo] = useState('github-pulse')

  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('pulse_theme')
    return saved !== null ? saved === 'dark' : true
  })

  const [overviewData, setOverviewData] = useState(null)
  const [repositories, setRepositories] = useState([])
  const [events, setEvents] = useState([])
  const [userProfile, setUserProfile] = useState(null)

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', darkMode ? 'dark' : 'light')
    localStorage.setItem('pulse_theme', darkMode ? 'dark' : 'light')
  }, [darkMode])

  const toggleTheme = () => setDarkMode((prev) => !prev)

  const loadDashboardData = useCallback(
    async (userToFetch = currentUser) => {
      setLoading(true)
      setError(null)

      try {
        const [overviewRes, reposRes, eventsRes, profileRes] = await Promise.allSettled([
          fetchOverview(userToFetch),
          fetchUserRepos(userToFetch),
          fetchEvents(userToFetch),
          fetchUserProfile(userToFetch),
        ])

        let hasSuccess = false

        if (overviewRes.status === 'fulfilled' && overviewRes.value.success) {
          setOverviewData(overviewRes.value)
          hasSuccess = true
        }

        if (reposRes.status === 'fulfilled' && reposRes.value.success) {
          setRepositories(reposRes.value.repositories || [])
          hasSuccess = true
        }

        if (eventsRes.status === 'fulfilled' && eventsRes.value.success) {
          setEvents(eventsRes.value.events || [])
          hasSuccess = true
        }

        if (profileRes.status === 'fulfilled' && profileRes.value.success) {
          setUserProfile(profileRes.value.user)
          hasSuccess = true
        }

        if (!hasSuccess) {
          throw new Error(
            overviewRes.reason?.message ||
              reposRes.reason?.message ||
              'Could not connect to GitHub Pulse API server.'
          )
        }
      } catch (err) {
        console.error('Dashboard data load error:', err)
        setError(err.message || 'Failed to communicate with the GitHub Pulse backend.')
      } finally {
        setLoading(false)
      }
    },
    [currentUser]
  )

  useEffect(() => {
    loadDashboardData(currentUser)
  }, [currentUser, loadDashboardData])

  const handleUserChange = (newUser) => {
    if (newUser && newUser !== currentUser) {
      setCurrentUser(newUser)
      setActiveTab('overview')
    }
  }

  const handleSelectRepo = (repoName) => {
    setSelectedRepo(repoName)
    setActiveTab('inspector')
  }

  return (
    <div className="dashboard-app">
      <Header
        currentUser={currentUser}
        userProfile={userProfile}
        onUserChange={handleUserChange}
        onRefresh={() => loadDashboardData(currentUser)}
        loading={loading}
        darkMode={darkMode}
        onToggleTheme={toggleTheme}
      />

      <div className="ticks" />

      <div className="main-nav-container">
        <nav className="main-nav-bar">
          <button
            className={`nav-tab ${activeTab === 'overview' ? 'nav-tab-active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            <LayoutDashboard size={16} />
            <span>Overview</span>
          </button>

          <button
            className={`nav-tab ${activeTab === 'repositories' ? 'nav-tab-active' : ''}`}
            onClick={() => setActiveTab('repositories')}
          >
            <BookMarked size={16} />
            <span>Repositories</span>
            {repositories.length > 0 && <span className="tab-pill">{repositories.length}</span>}
          </button>

          <button
            className={`nav-tab ${activeTab === 'inspector' ? 'nav-tab-active' : ''}`}
            onClick={() => setActiveTab('inspector')}
          >
            <Layers size={16} />
            <span>Repo Inspector</span>
            {selectedRepo && <span className="tab-pill tab-pill-repo">{selectedRepo}</span>}
          </button>

          <button
            className={`nav-tab ${activeTab === 'activity' ? 'nav-tab-active' : ''}`}
            onClick={() => setActiveTab('activity')}
          >
            <Activity size={16} />
            <span>Live Pulse</span>
            {events.length > 0 && <span className="tab-pill">{events.length}</span>}
          </button>
        </nav>
      </div>

      <main className="dashboard-content">
        {loading && !overviewData ? (
          <LoadingSpinner message={`Connecting to GitHub App and syncing ${currentUser}...`} />
        ) : error && !overviewData ? (
          <ErrorState
            title="Backend Sync Error"
            message={error}
            onRetry={() => loadDashboardData(currentUser)}
          />
        ) : (
          <>
            {activeTab === 'overview' && (
              <OverviewTab
                overviewData={overviewData}
                onSelectRepo={handleSelectRepo}
                onSwitchTab={(tab) => setActiveTab(tab)}
              />
            )}

            {activeTab === 'repositories' && (
              <RepositoriesTab repositories={repositories} onSelectRepo={handleSelectRepo} />
            )}

            {activeTab === 'inspector' && (
              <RepoInspectorTab
                selectedRepoName={selectedRepo}
                repositories={repositories}
                owner={currentUser}
                onSelectRepo={(name) => setSelectedRepo(name)}
              />
            )}

            {activeTab === 'activity' && (
              <ActivityTab events={events} onSelectRepo={handleSelectRepo} />
            )}
          </>
        )}
      </main>

      <footer className="dashboard-footer">
        <div className="footer-content">
          <div className="footer-left">
            <span className="footer-brand">GitHub Pulse</span>
            <span className="footer-sep">•</span>
            <span className="footer-sub">Authenticated Developer Portal</span>
          </div>

          <div className="footer-right">
            <div className="footer-status-pill">
              <span className="status-dot" />
              <span>Express API & Octokit Online</span>
            </div>
            <a
              href="https://github.com/deep-2105/github-pulse"
              target="_blank"
              rel="noreferrer"
              className="footer-link"
            >
              <ExternalLink size={14} /> Repository
            </a>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default App
