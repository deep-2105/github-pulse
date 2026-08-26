export function LoadingSpinner({ message = "Loading data from GitHub..." }) {
  return (
    <div className="loading-container">
      <div className="spinner-ring">
        <div className="spinner-inner"></div>
      </div>
      <p className="loading-text">{message}</p>
    </div>
  );
}

export function ErrorState({ title = "Failed to load", message, onRetry }) {
  return (
    <div className="error-card">
      <div className="error-icon">⚠️</div>
      <div className="error-content">
        <h4 className="error-title">{title}</h4>
        <p className="error-desc">{message || "An unexpected error occurred while communicating with GitHub API."}</p>
        {onRetry && (
          <button className="btn-retry" onClick={onRetry}>
            Try Again
          </button>
        )}
      </div>
    </div>
  );
}

