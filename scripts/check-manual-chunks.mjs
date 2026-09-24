#!/usr/bin/env node
/**
 * Canonical regression guard for pattern V15: Rollup/Vite manualChunks
 * vendor<->leaf chunk cycle.
 *
 * Rule: all node_modules code must resolve to a single vendor-style chunk.
 * Splitting any node_modules package into a separate chunk from React creates
 * circular ESM chunk dependencies that crash production bundles with
 * "Cannot access '_' before initialization" (blank page). This only manifests
 * in the real production bundle, never in dev.
 *
 * Handles: object-literal form, method-shorthand functions, arrow functions,
 * regular function expressions, nested parens in conditions, and strips both
 * line and block comments so guardrail comments don't self-trigger.
 *
 * Pass `--test` to run the built-in test suite.
 * Exit 0 on PASS, 1 on FAIL.
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

// ── Core helpers ────────────────────────────────────────────────────────────

/** Strip JS line and block comments from source text. */
function stripComments(src) {
  return src.replace(/\/\*[\s\S]*?\*\//g, "").replace(/\/\/[^\n]*/g, "");
}

/** Extract the content between balanced braces starting at or after `from`. */
function extractBlock(text, from) {
  const open = text.indexOf("{", from);
  if (open === -1) return null;
  let depth = 0;
  for (let i = open; i < text.length; i++) {
    if (text[i] === "{") depth++;
    else if (text[i] === "}") {
      depth--;
      if (depth === 0) return { body: text.slice(open + 1, i), end: i };
    }
  }
  return { body: text.slice(open + 1), end: text.length };
}

/** Extract balanced paren content starting at the opening `(` at `from`. */
function extractParens(text, from) {
  let depth = 0;
  for (let i = from; i < text.length; i++) {
    if (text[i] === "(") depth++;
    else if (text[i] === ")") {
      depth--;
      if (depth === 0) return { content: text.slice(from + 1, i), end: i };
    }
  }
  return { content: text.slice(from + 1), end: text.length };
}

// ── Core check ──────────────────────────────────────────────────────────────

/**
 * Analyze manualChunks configuration in the given source text.
 * @returns {{ pass: boolean, message: string }}
 */
function check(src) {
  const code = stripComments(src);

  if (!code.includes("manualChunks")) {
    return { pass: true, message: "no manualChunks configured" };
  }

  // Detect whether this is a function form (takes precedence) or object form.
  // Function indicators: manualChunks( or manualChunks: (id) => or manualChunks: function(
  const fnIndicator =
    code.match(/manualChunks\s*\(/) ||
    code.match(/manualChunks\s*:\s*(?:async\s*)?(?:\(|function\b)/);

  // ── Object-literal form ──────────────────────────────────────────────
  const objMatch = code.match(/manualChunks\s*:\s*\{/);
  if (objMatch && !fnIndicator) {
    const block = extractBlock(code, objMatch.index);
    if (!block) return { pass: true, message: "manualChunks object empty" };

    const names = new Set();
    let depth = 0;
    for (const line of block.body.split("\n")) {
      // Track nesting depth so we skip keys inside arrays/nested objects
      for (const ch of line) {
        if (ch === "[" || ch === "{") depth++;
        if (ch === "]" || ch === "}") depth--;
      }
      if (depth === 0) {
        const m = line.match(/^\s*(?:["']([^"']+)["']|([A-Za-z_$][\w$-]*))\s*:/);
        if (m) names.add(m[1] || m[2]);
      }
    }

    if (names.size > 1) {
      return {
        pass: false,
        message: `object-form manualChunks has ${names.size} buckets: [${[...names].join(", ")}]; only one vendor bucket is allowed`,
      };
    }
    return {
      pass: true,
      message: `single object bucket: ${[...names][0] ?? "empty"}`,
    };
  }

  // ── Function form ────────────────────────────────────────────────────
  const fnMatch = code.match(
    /manualChunks\s*(?::\s*(?:async\s*)?(?:function\s*)?)?\(/
  );
  if (!fnMatch) {
    return {
      pass: false,
      message:
        "manualChunks present but form not recognized; update the guard or simplify the config",
    };
  }

  const fnBlock = extractBlock(code, fnMatch.index);
  if (!fnBlock) {
    return { pass: true, message: "manualChunks function body empty" };
  }
  const fnBody = fnBlock.body;

  // Find every `if` whose condition mentions `node_modules` and collect
  // all chunk names returned within its guarded block (including nested ifs).
  const chunkNames = new Set();
  const ifRe = /\bif\s*\(/g;
  let ifMatch;

  while ((ifMatch = ifRe.exec(fnBody)) !== null) {
    const parenStart = fnBody.indexOf("(", ifMatch.index);
    const { content: condition, end: condEnd } = extractParens(
      fnBody,
      parenStart
    );

    if (!condition.includes("node_modules")) continue;

    // Find the guarded block or single statement after the condition
    let pos = condEnd + 1;
    while (pos < fnBody.length && /\s/.test(fnBody[pos])) pos++;

    let guardedText;
    if (fnBody[pos] === "{") {
      const inner = extractBlock(fnBody, pos);
      guardedText = inner ? inner.body : "";
    } else {
      // Single-statement: if (...) return "x";
      const semi = fnBody.indexOf(";", pos);
      guardedText = fnBody.slice(pos, semi === -1 ? pos + 300 : semi);
    }

    for (const r of guardedText.matchAll(/\breturn\s+["'`]([^"'`]+)["'`]/g)) {
      chunkNames.add(r[1]);
    }
  }

  if (chunkNames.size === 0) {
    return {
      pass: true,
      message: "function form with no node_modules return branches",
    };
  }
  if (chunkNames.size > 1) {
    return {
      pass: false,
      message: `node_modules branches return ${chunkNames.size} distinct chunk names: [${[...chunkNames].join(", ")}]; all must resolve to one`,
    };
  }
  return {
    pass: true,
    message: `all node_modules branches return "${[...chunkNames][0]}"`,
  };
}

// ── Test suite (run with --test) ────────────────────────────────────────────

function runTests() {
  let passed = 0;
  let failed = 0;

  function assert(name, src, expectPass) {
    const result = check(src);
    if (result.pass === expectPass) {
      passed++;
    } else {
      failed++;
      console.error(`  FAIL: ${name}`);
      console.error(
        `    expected ${expectPass ? "PASS" : "FAIL"}, got ${result.pass ? "PASS" : "FAIL"}: ${result.message}`
      );
    }
  }

  // ── PASS cases ──────────────────────────────────────────────────────

  assert(
    "no-manual-chunks",
    `export default defineConfig({ build: {} });`,
    true
  );

  assert(
    "object-single-bucket",
    `export default defineConfig({ build: { rollupOptions: { output: {
      manualChunks: { vendor: ["react", "react-dom"] },
    } } } });`,
    true
  );

  assert(
    "method-shorthand-single-vendor",
    `export default defineConfig({ build: { rollupOptions: { output: {
      manualChunks(id) {
        if (id.includes("node_modules")) return "vendor";
      },
    } } } });`,
    true
  );

  assert(
    "arrow-function-single-vendor",
    `export default defineConfig({ build: { rollupOptions: { output: {
      manualChunks: (id) => {
        if (id.includes("node_modules")) return "vendor";
      },
    } } } });`,
    true
  );

  assert(
    "nested-sub-branches-all-vendor",
    `export default defineConfig({ build: { rollupOptions: { output: {
      manualChunks(id) {
        if (id.includes("vite/preload-helper")) return "vendor";
        if (id.includes("node_modules")) {
          if (id.includes("node_modules/react-dom")) return "vendor";
          if (chartsMatchers.some((m) => id.includes(m))) return "vendor";
          return "vendor";
        }
        if (sections.some((s) => id.includes(s))) return "landing-below-fold";
        return undefined;
      },
    } } } });`,
    true
  );

  assert(
    "comment-only-mention-stripped",
    `// If manualChunks is ever added, keep all node_modules in vendor.
    export default defineConfig({ build: {} });`,
    true
  );

  assert(
    "block-comment-stripped",
    `/* manualChunks: { vendor: [...], charts: [...] } */
    export default defineConfig({ build: {} });`,
    true
  );

  assert(
    "guardrail-comment-above-real-config",
    `export default defineConfig({ build: { rollupOptions: { output: {
      // Do not split manualChunks into multiple buckets.
      manualChunks(id) {
        if (id.includes("node_modules")) return "vendor";
      },
    } } } });`,
    true
  );

  assert(
    "single-statement-if-no-braces",
    `export default defineConfig({ build: { rollupOptions: { output: {
      manualChunks(id) {
        if (id.includes("node_modules")) return "vendor";
      },
    } } } });`,
    true
  );

  assert(
    "app-code-chunks-are-fine",
    `export default defineConfig({ build: { rollupOptions: { output: {
      manualChunks(id) {
        if (id.includes("node_modules")) return "vendor";
        if (id.includes("src/heavy")) return "heavy";
      },
    } } } });`,
    true
  );

  assert(
    "no-node-modules-branches",
    `export default defineConfig({ build: { rollupOptions: { output: {
      manualChunks(id) {
        if (id.includes("src/heavy")) return "heavy";
      },
    } } } });`,
    true
  );

  // ── FAIL cases ──────────────────────────────────────────────────────

  assert(
    "object-multi-bucket",
    `export default defineConfig({ build: { rollupOptions: { output: {
      manualChunks: {
        vendor: ["react", "react-dom"],
        charts: ["recharts"],
        ui: ["@radix-ui/react-dialog"],
      },
    } } } });`,
    false
  );

  assert(
    "function-multi-vendor-names",
    `export default defineConfig({ build: { rollupOptions: { output: {
      manualChunks(id) {
        if (id.includes("node_modules/recharts")) return "charts";
        if (id.includes("node_modules")) return "vendor";
      },
    } } } });`,
    false
  );

  assert(
    "function-nested-parens-multi",
    `export default defineConfig({ build: { rollupOptions: { output: {
      manualChunks(id) {
        if (id.includes("node_modules/recharts")) return "charts";
        if (id.includes("node_modules/react")) return "vendor";
      },
    } } } });`,
    false
  );

  console.log(
    `\ncheck-manual-chunks tests: ${passed} passed, ${failed} failed, ${passed + failed} total`
  );
  process.exit(failed > 0 ? 1 : 0);
}

// ── Main ────────────────────────────────────────────────────────────────────

if (process.argv.includes("--test")) {
  runTests();
} else {
  const root = path.resolve(
    path.dirname(fileURLToPath(import.meta.url)),
    ".."
  );
  const configPath = path.join(root, "vite.config.ts");

  if (!fs.existsSync(configPath)) {
    console.log("check-manual-chunks: PASS (no vite.config.ts)");
    process.exit(0);
  }

  const src = fs.readFileSync(configPath, "utf8");
  const result = check(src);

  if (result.pass) {
    console.log(`check-manual-chunks: PASS (${result.message})`);
    process.exit(0);
  } else {
    console.error(`check-manual-chunks: FAIL — ${result.message}`);
    console.error(
      "All third-party (node_modules) code must stay in a single vendor chunk. " +
        "Splitting can create circular ESM chunk dependencies that crash production bundles."
    );
    process.exit(1);
  }
}
