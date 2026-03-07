import { ScreepsAPI } from "screeps-api";
import fs from "fs";
import { execSync } from "child_process";
import { config } from "../config";

const getScreepsAPI = async () => {

    const api = new ScreepsAPI({
        token: config.screepsAuthToken,
        protocol: "https",
        hostname: config.screepsHost,
        port: 443,
        path: config.screepsPath,
    });

    return api;
}



(async () => {
  const api = await getScreepsAPI();

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
