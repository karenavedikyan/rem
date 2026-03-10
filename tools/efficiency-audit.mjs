import { promises as fs } from "node:fs";
import path from "node:path";

const rootDir = process.cwd();
const skipDirs = new Set([".git", "node_modules", ".next", "dist", "build", ".vercel"]);
const urlAttrRegex = /\b(?:href|src)\s*=\s*["']([^"']+)["']/gi;
const idRegex = /\sid=["']([^"']+)["']/gi;
const ignoredSchemes = ["http://", "https://", "mailto:", "tel:", "javascript:", "data:"];

const linkErrors = [];
const linkWarnings = [];
const sizeWarnings = [];

const fileExists = async (filePath) => {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
};

const collectFiles = async (dir, matcher, bucket = []) => {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (skipDirs.has(entry.name)) continue;
      await collectFiles(fullPath, matcher, bucket);
      continue;
    }
    if (matcher(fullPath)) bucket.push(fullPath);
  }
  return bucket;
};

const normalizeLocalPath = async (baseFile, rawPath) => {
  const trimmed = rawPath.trim();
  const hashIndex = trimmed.indexOf("#");
  const queryIndex = trimmed.indexOf("?");
  const cutAt =
    hashIndex < 0 ? queryIndex : queryIndex < 0 ? hashIndex : Math.min(hashIndex, queryIndex);
  const pathPart = (cutAt >= 0 ? trimmed.slice(0, cutAt) : trimmed).trim();
  const hash = hashIndex >= 0 ? trimmed.slice(hashIndex + 1).trim() : "";

  let resolvedPath;
  if (!pathPart) {
    resolvedPath = baseFile;
  } else if (pathPart.startsWith("/")) {
    resolvedPath = path.join(rootDir, pathPart);
  } else {
    resolvedPath = path.resolve(path.dirname(baseFile), pathPart);
  }

  if (!(await fileExists(resolvedPath))) {
    const htmlTry = `${resolvedPath}.html`;
    const dirTry = path.join(resolvedPath, "index.html");
    if (await fileExists(htmlTry)) {
      resolvedPath = htmlTry;
    } else if (await fileExists(dirTry)) {
      resolvedPath = dirTry;
    }
  } else {
    try {
      const stat = await fs.stat(resolvedPath);
      if (stat.isDirectory()) {
        const dirIndex = path.join(resolvedPath, "index.html");
        if (await fileExists(dirIndex)) resolvedPath = dirIndex;
      }
    } catch {
      // noop
    }
  }

  return { resolvedPath: path.normalize(resolvedPath), hash };
};

const getIdsForHtml = async (filePath, idCache) => {
  if (idCache.has(filePath)) return idCache.get(filePath);
  const html = await fs.readFile(filePath, "utf8");
  const ids = new Set();
  const duplicates = new Set();
  let match;
  while ((match = idRegex.exec(html)) !== null) {
    const id = match[1];
    if (ids.has(id)) duplicates.add(id);
    ids.add(id);
  }
  idCache.set(filePath, ids);
  if (duplicates.size > 0) {
    linkWarnings.push(
      `[duplicate-id] ${path.relative(rootDir, filePath)}: ${Array.from(duplicates).join(", ")}`
    );
  }
  return ids;
};

const runLinkAudit = async () => {
  const htmlFiles = await collectFiles(
    rootDir,
    (filePath) => filePath.endsWith(".html")
  );
  const idCache = new Map();

  for (const htmlFile of htmlFiles) {
    const content = await fs.readFile(htmlFile, "utf8");
    let match;
    while ((match = urlAttrRegex.exec(content)) !== null) {
      const url = match[1].trim();
      if (!url || url.startsWith("//")) continue;
      if (ignoredSchemes.some((scheme) => url.startsWith(scheme))) continue;

      const { resolvedPath, hash } = await normalizeLocalPath(htmlFile, url);
      const exists = await fileExists(resolvedPath);
      const relativeRef = path.relative(rootDir, htmlFile);

      if (!exists) {
        linkErrors.push(`[missing-target] ${relativeRef} -> ${url}`);
        continue;
      }

      const relResolved = path.relative(rootDir, resolvedPath);
      if (relResolved.startsWith("..")) {
        linkWarnings.push(`[outside-root] ${relativeRef} -> ${url}`);
      }

      if (hash && resolvedPath.endsWith(".html")) {
        const ids = await getIdsForHtml(resolvedPath, idCache);
        if (!ids.has(hash)) {
          linkErrors.push(`[missing-anchor] ${relativeRef} -> ${url} (#${hash})`);
        }
      }
    }
  }
};

const runSizeAudit = async () => {
  const assets = await collectFiles(
    rootDir,
    (filePath) =>
      (filePath.endsWith(".js") || filePath.endsWith(".css")) &&
      !filePath.includes(`${path.sep}backend${path.sep}`)
  );

  const budgets = {
    ".css": 220 * 1024,
    ".js": 260 * 1024,
  };

  for (const filePath of assets) {
    const ext = path.extname(filePath);
    const budget = budgets[ext];
    if (!budget) continue;
    const stat = await fs.stat(filePath);
    if (stat.size > budget) {
      sizeWarnings.push(
        `[large-asset] ${path.relative(rootDir, filePath)} = ${(stat.size / 1024).toFixed(1)}KB (budget ${(
          budget / 1024
        ).toFixed(0)}KB)`
      );
    }
  }
};

const main = async () => {
  await runLinkAudit();
  await runSizeAudit();

  console.log("RemCard efficiency audit");
  console.log(`- Link errors: ${linkErrors.length}`);
  console.log(`- Link warnings: ${linkWarnings.length}`);
  console.log(`- Size warnings: ${sizeWarnings.length}`);

  if (linkWarnings.length) {
    console.log("\nWarnings:");
    for (const warning of linkWarnings) console.log(`  ${warning}`);
  }
  if (sizeWarnings.length) {
    console.log("\nPotential optimizations:");
    for (const warning of sizeWarnings) console.log(`  ${warning}`);
  }
  if (linkErrors.length) {
    console.error("\nBroken references:");
    for (const error of linkErrors) console.error(`  ${error}`);
    process.exitCode = 1;
    return;
  }

  console.log("\nAudit passed with no broken local links.");
};

main().catch((err) => {
  console.error("Efficiency audit failed:", err);
  process.exitCode = 1;
});
