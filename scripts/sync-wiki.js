#!/usr/bin/env node
// Syncs documentation files from the main repo to the GitHub Wiki checkout.
// Run from the repository root with the wiki checked out at ./wiki.

const fs = require("fs");
const path = require("path");

const repoRoot = path.resolve(__dirname, "..");
const wikiDir = path.join(repoRoot, "wiki");

const files = [
  { src: "README.md", dest: "Home.md" },
  { src: "docs/API.md", dest: "API-Reference.md" },
  { src: "docs/DEPLOYMENT.md", dest: "Deployment.md" },
  { src: "docs/DEVELOPMENT.md", dest: "Development.md" },
  { src: "docs/ARCHITECTURE.md", dest: "Architecture.md" },
  { src: "docs/MCP.md", dest: "MCP-Server.md" },
  { src: "docs/FAQ.md", dest: "FAQ.md" },
  { src: "ROADMAP.md", dest: "Roadmap.md" },
  { src: "CONTRIBUTING.md", dest: "Contributing.md" },
  { src: "SECURITY.md", dest: "Security.md" },
];

const pageNameByBasename = files.reduce((acc, { src, dest }) => {
  acc[path.basename(src)] = path.basename(dest, ".md");
  return acc;
}, {});

function rewriteLinks(content) {
  // Match markdown links: [text](url)
  return content.replace(/\]\(\s*([^)\s]+)\s*\)/g, (match, rawUrl) => {
    // Keep external / absolute URLs as-is.
    if (/^[a-z][a-z0-9+.-]*:/i.test(rawUrl)) {
      return match;
    }

    // Separate path from fragment/query.
    const [rawPath] = rawUrl.split(/[?#]/);
    const basename = path.basename(rawPath);

    const pageName = pageNameByBasename[basename];
    if (!pageName) {
      return match;
    }

    return `](${pageName})`;
  });
}

function ensureWikiDir() {
  if (!fs.existsSync(wikiDir)) {
    fs.mkdirSync(wikiDir, { recursive: true });
  }
}

function copyAndRewrite(src, dest) {
  const srcPath = path.join(repoRoot, src);
  if (!fs.existsSync(srcPath)) {
    console.warn(`Skipping ${src} — file not found`);
    fs.rmSync(path.join(wikiDir, dest), { force: true });
    return;
  }
  const content = fs.readFileSync(srcPath, "utf8");
  const rewritten = rewriteLinks(content);
  fs.writeFileSync(path.join(wikiDir, dest), rewritten, "utf8");
  console.log(`Synced ${src} -> wiki/${dest}`);
}

function generateSidebar() {
  const entries = [
    { label: "Home", page: "Home" },
    { label: "Quick Start", page: "Quick-Start" },
    { label: "Deployment", page: "Deployment" },
    { label: "Development", page: "Development" },
    { label: "API Reference", page: "API-Reference" },
    { label: "Architecture", page: "Architecture" },
    { label: "MCP Server", page: "MCP-Server" },
    { label: "FAQ", page: "FAQ" },
    { label: "Roadmap", page: "Roadmap" },
    { label: "Contributing", page: "Contributing" },
    { label: "Security", page: "Security" },
  ];

  const lines = [
    "## Documentation",
    "",
    ...entries.map(({ label, page }) => `- [${label}](${page})`),
    "",
  ];

  fs.writeFileSync(path.join(wikiDir, "_Sidebar.md"), lines.join("\n"), "utf8");
  console.log("Generated wiki/_Sidebar.md");
}

function main() {
  ensureWikiDir();

  for (const { src, dest } of files) {
    copyAndRewrite(src, dest);
  }

  generateSidebar();

  // Remove stale files that are not part of our managed set.
  const managed = new Set([...files.map((f) => f.dest), "_Sidebar.md"]);
  for (const entry of fs.readdirSync(wikiDir)) {
    if (!managed.has(entry)) {
      fs.rmSync(path.join(wikiDir, entry), { recursive: true, force: true });
      console.log(`Removed stale wiki/${entry}`);
    }
  }
}

main();
