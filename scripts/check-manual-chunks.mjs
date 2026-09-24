#!/usr/bin/env node
// Regression guard for pattern V15: manualChunks vendor <-> leaf chunk cycles.
// Splitting any node_modules package into a chunk separate from React can
// create a circular ESM chunk dependency that only crashes in the real
// production bundle. This check fails the build if that happens.
import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const src = readFileSync(resolve(root, "vite.config.ts"), "utf8");

const pass = () => {
  console.log("check-manual-chunks: PASS");
  process.exit(0);
};
const fail = (msg) => {
  console.error(`check-manual-chunks: FAIL - ${msg}`);
  process.exit(1);
};

// Strip line and block comments so commented-out code is ignored.
const code = src.replace(/\/\*[\s\S]*?\*\//g, "").replace(/(^|[^:])\/\/.*$/gm, "$1");

if (!code.includes("manualChunks")) pass();

// Return the text inside the brace block that opens at or after `from`.
function blockAfter(text, from) {
  const open = text.indexOf("{", from);
  if (open === -1) return "";
  let depth = 0;
  for (let i = open; i < text.length; i++) {
    if (text[i] === "{") depth++;
    else if (text[i] === "}" && --depth === 0) return text.slice(open + 1, i);
  }
  return text.slice(open + 1);
}

const objMatch = code.match(/manualChunks\s*:\s*\{/);
if (objMatch) {
  const body = blockAfter(code, objMatch.index);
  // Top-level keys only: track depth while scanning for `key:`.
  const names = new Set();
  let depth = 0;
  const re = /([{}\[\]])|(?:^|[,\s])(["']?)([A-Za-z0-9_$-]+)\2\s*:/g;
  let m;
  while ((m = re.exec(body))) {
    if (m[1]) {
      depth += m[1] === "{" || m[1] === "[" ? 1 : -1;
    } else if (depth === 0) {
      names.add(m[3]);
    }
  }
  if (names.size > 1) {
    fail(`object-form manualChunks defines ${names.size} buckets (${[...names].join(", ")}); only one vendor bucket is allowed.`);
  }
  pass();
}

const fnMatch = code.match(/manualChunks\s*(?::\s*(?:function\s*)?)?\(\s*\w+[^)]*\)\s*(?:=>\s*)?\{/);
if (!fnMatch) fail("manualChunks found but its form could not be parsed; update the check or simplify the config.");

const fnBody = blockAfter(code, fnMatch.index);
const names = new Set();
const nmRe = /\bif\s*\([^{]*node_modules[^{]*\)\s*\{/g;
let found = 0;
let m;
while ((m = nmRe.exec(fnBody))) {
  found++;
  const block = blockAfter(fnBody, m.index);
  for (const r of block.matchAll(/return\s+(["'`])([^"'`]+)\1/g)) names.add(r[2]);
  for (const r of block.matchAll(/return\s+(?!["'`])([A-Za-z_$][\w$.]*)/g)) {
    if (r[1] !== "undefined" && r[1] !== "null") names.add(`<dynamic:${r[1]}>`);
  }
}

if (found === 0) pass();
if (names.size > 1) {
  fail(`node_modules branches return multiple chunk names (${[...names].join(", ")}); all third-party code must resolve to one vendor chunk.`);
}
pass();
