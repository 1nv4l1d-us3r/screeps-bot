import { ScreepsAPI } from "screeps-api";
import fs from "fs";
import { execSync } from "child_process";

(async () => {
  const api = await ScreepsAPI.fromConfig("main");

  // Get current git branch name
  const gitBranch = execSync("git branch --show-current")
    .toString()
    .trim();

  const code = fs.readFileSync("dist/main.js", "utf8");

  await api.code.set(
    gitBranch,
    { main: code },
    undefined
  );

  console.log(`🚀 Code Synced to Screeps branch: ${gitBranch}`);
})();
