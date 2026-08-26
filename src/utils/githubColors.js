export const GITHUB_LANGUAGE_COLORS = {
  JavaScript: "#f1e05a",
  TypeScript: "#3178c6",
  HTML: "#e34c26",
  CSS: "#563d7c",
  Python: "#3572A5",
  Java: "#b07219",
  "C++": "#f34b7d",
  C: "#555555",
  "C#": "#178600",
  Go: "#00ADD8",
  Rust: "#dea584",
  PHP: "#4F5D95",
  Ruby: "#701516",
  Swift: "#F05138",
  Kotlin: "#A97BFF",
  Dart: "#00B4AB",
  Shell: "#89e051",
  "Jupyter Notebook": "#DA5B0B",
  Vue: "#41b883",
  Svelte: "#ff3e00",
  SCSS: "#c6538c",
  Dockerfile: "#384d54",
  Makefile: "#427819",
  Lua: "#000080",
  R: "#198CE7",
  Scala: "#c22d40",
  Elixir: "#6e4a7e",
  Clojure: "#db5855",
  Haskell: "#5e5086",
};

export function getLanguageColor(language) {
  if (!language) return "#8b949e";
  return GITHUB_LANGUAGE_COLORS[language] || "#58a6ff";
}

