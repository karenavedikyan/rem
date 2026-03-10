import { promises as fs } from "node:fs";
import path from "node:path";

const root = process.cwd();
const linksPath = path.join(root, ".lighthouseci", "links.json");
const summaryPath = process.env.GITHUB_STEP_SUMMARY;

const main = async () => {
  let links = [];
  try {
    const raw = await fs.readFile(linksPath, "utf8");
    links = JSON.parse(raw);
  } catch {
    // No links file available; skip quietly.
  }

  if (!summaryPath) return;

  const lines = ["## Lighthouse mobile report", ""];
  if (!Array.isArray(links) || links.length === 0) {
    lines.push("- No public Lighthouse links were generated in this run.");
  } else {
    for (const link of links) lines.push(`- ${link}`);
  }
  lines.push("");

  await fs.appendFile(summaryPath, `${lines.join("\n")}\n`, "utf8");
};

main().catch((err) => {
  console.error("Could not build Lighthouse summary:", err);
});
