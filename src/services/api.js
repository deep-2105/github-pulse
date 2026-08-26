const API_BASE = "";

export async function fetchHealth() {
  const res = await fetch(`${API_BASE}/api/health`);
  if (!res.ok) throw new Error("Backend connection error");
  return res.json();
}

export async function fetchUserProfile(username = "deep-2105") {
  const res = await fetch(`${API_BASE}/api/github/user/${username}`);
  if (!res.ok) throw new Error(`Failed to load profile for ${username}`);
  return res.json();
}

export async function fetchUserRepos(username = "deep-2105", sort = "pushed") {
  const res = await fetch(`${API_BASE}/api/github/repos?username=${username}&sort=${sort}`);
  if (!res.ok) throw new Error("Failed to load repositories");
  return res.json();
}

export async function fetchRepoDetails(owner, repo) {
  const res = await fetch(`${API_BASE}/api/github/repos/${owner}/${repo}`);
  if (!res.ok) throw new Error(`Failed to load details for ${owner}/${repo}`);
  return res.json();
}

export async function fetchRepoCommits(owner, repo, perPage = 30, page = 1) {
  const res = await fetch(`${API_BASE}/api/github/repos/${owner}/${repo}/commits?per_page=${perPage}&page=${page}`);
  if (!res.ok) throw new Error("Failed to load commits");
  return res.json();
}

export async function fetchRepoPulls(owner, repo, state = "all") {
  const res = await fetch(`${API_BASE}/api/github/repos/${owner}/${repo}/pulls?state=${state}`);
  if (!res.ok) throw new Error("Failed to load pull requests");
  return res.json();
}

export async function fetchRepoIssues(owner, repo, state = "all") {
  const res = await fetch(`${API_BASE}/api/github/repos/${owner}/${repo}/issues?state=${state}`);
  if (!res.ok) throw new Error("Failed to load issues");
  return res.json();
}

export async function fetchRepoLanguages(owner, repo) {
  const res = await fetch(`${API_BASE}/api/github/repos/${owner}/${repo}/languages`);
  if (!res.ok) throw new Error("Failed to load repository languages");
  return res.json();
}

export async function fetchRepoContributors(owner, repo) {
  const res = await fetch(`${API_BASE}/api/github/repos/${owner}/${repo}/contributors`);
  if (!res.ok) throw new Error("Failed to load contributors");
  return res.json();
}

export async function fetchRepoBranches(owner, repo) {
  const res = await fetch(`${API_BASE}/api/github/repos/${owner}/${repo}/branches`);
  if (!res.ok) throw new Error("Failed to load branches");
  return res.json();
}

export async function fetchEvents(username = "deep-2105") {
  const res = await fetch(`${API_BASE}/api/github/events?username=${username}`);
  if (!res.ok) throw new Error("Failed to load activity events");
  return res.json();
}

export async function fetchOverview(username = "deep-2105") {
  const res = await fetch(`${API_BASE}/api/github/overview/${username}`);
  if (!res.ok) throw new Error("Failed to load overview");
  return res.json();
}

