import app from "./app.js";
import { fileURLToPath } from "node:url";

const isDirectRun = process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1];

if (isDirectRun) {
  const PORT = process.env.PORT || 3001;
  app.listen(PORT, () => {
    console.log(`GitHub Pulse backend running at http://localhost:${PORT}`);
  });
}

export default app;


