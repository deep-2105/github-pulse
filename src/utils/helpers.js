export function formatTimeAgo(dateString) {
  if (!dateString) return "";
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now - date) / 1000);

  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months}mo ago`;
  const years = Math.floor(days / 365);
  return `${years}y ago`;
}

export function formatDate(dateString) {
  if (!dateString) return "";
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function formatNumber(num) {
  if (num === undefined || num === null) return "0";
  if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
  if (num >= 1000) return (num / 1000).toFixed(1) + "k";
  return num.toString();
}

export function formatBytes(bytes) {
  if (bytes === 0 || !bytes) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
}

export function calculatePulseScore(stats) {
  if (!stats) return { score: 85, label: "Active", grade: "A" };
  
  let score = 50;
  // Repos contribution
  score += Math.min((stats.totalRepos || 0) * 3, 20);
  // Stars contribution
  score += Math.min((stats.totalStars || 0) * 5, 15);
  // Activity contribution
  const pushEvents = stats.activityByType?.PushEvent || 0;
  score += Math.min(pushEvents * 2, 15);

  score = Math.min(Math.max(score, 10), 100);

  let label;
  let grade;
  if (score >= 90) {
    label = "Exceptional";
    grade = "A+";
  } else if (score >= 80) {
    label = "Very High";
    grade = "A";
  } else if (score >= 70) {
    label = "High";
    grade = "B+";
  } else if (score >= 50) {
    label = "Active";
    grade = "B";
  } else {
    label = "Building";
    grade = "C";
  }

  return { score, label, grade };
}

