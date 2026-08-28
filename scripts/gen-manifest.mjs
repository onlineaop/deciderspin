import fs from "node:fs";
import path from "node:path";

const outDir = path.resolve("out");
const files = [];

function walk(dir, prefix) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    const rel = prefix ? prefix + "/" + entry.name : entry.name;
    if (entry.isDirectory()) {
      walk(full, rel);
    } else {
      files.push({ name: rel, path: full.split(path.sep).join("/") });
    }
  }
}

walk(outDir, "");
fs.writeFileSync("scripts/deploy-manifest.json", JSON.stringify(files));
console.log("files:", files.length);
console.log(files.slice(0, 5));
