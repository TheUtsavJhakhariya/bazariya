/*
 * serve.js — tiny local web server for testing the site (no packages needed).
 *
 * Why: browsers block fetch() of config.json and the CSV when you open
 * index.html by double-clicking it. Run this instead:
 *
 *     node tools/serve.js            then open http://localhost:8000
 *     node tools/serve.js 8080       use another port
 *
 * To test a GitHub Pages style sub-path (https://user.github.io/bazariya/):
 *     node tools/serve.js 8000 bazariya     then open http://localhost:8000/bazariya/
 *
 * Stop it with Ctrl + C.
 */

"use strict";

const http = require("http");
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const PORT = Number(process.argv[2]) || 8000;
// Optional sub-path prefix, always with a leading and trailing slash.
const PREFIX = ("/" + (process.argv[3] || "").replace(/^\/+|\/+$/g, "") + "/").replace("//", "/");

const TYPES = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".csv": "text/csv; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".ico": "image/x-icon",
  ".md": "text/plain; charset=utf-8",
};

http.createServer((req, res) => {
  let urlPath = decodeURIComponent(req.url.split("?")[0]);

  // Only serve inside the prefix (when one is given).
  if (!urlPath.startsWith(PREFIX)) {
    res.writeHead(404, { "Content-Type": "text/plain" });
    return res.end("Not found (site is served under " + PREFIX + ")");
  }
  urlPath = urlPath.slice(PREFIX.length - 1);
  if (urlPath.endsWith("/")) urlPath += "index.html";

  // Block "../" tricks: the resolved file must stay inside the project folder.
  const filePath = path.join(ROOT, path.normalize(urlPath));
  if (!filePath.startsWith(ROOT) || filePath.includes(path.sep + "legacy" + path.sep)) {
    res.writeHead(403);
    return res.end("Forbidden");
  }

  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404, { "Content-Type": "text/plain" });
      return res.end("Not found");
    }
    res.writeHead(200, {
      "Content-Type": TYPES[path.extname(filePath).toLowerCase()] || "application/octet-stream",
      "Cache-Control": "no-cache",
    });
    res.end(data);
  });
}).listen(PORT, () => {
  console.log("BAZARIYAA running at http://localhost:" + PORT + PREFIX + "  (Ctrl + C to stop)");
});
