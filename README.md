# 📊 Code Health Meter

[![DOI](https://zenodo.org/badge/DOI/10.5281/zenodo.15501897.svg)](https://doi.org/10.5281/zenodo.15501897)
[![npm version](https://img.shields.io/npm/v/code-health-meter.svg?color=blue)](https://www.npmjs.com/package/code-health-meter)

> **TOSEM 2025 Publication**  
> _Code Health Meter: A Quantitative and Graph-Theoretic Foundation for Automated Code Quality and Architecture Assessment_  
> 📄 [ACM TOSEM Paper](https://dl.acm.org/doi/10.1145/3737670)

---

## ✨ Overview

**Code Health Meter (CHM)** is a deterministic and modular static analysis framework that produces a formal, reproducible six-dimensional signature for each source module. It integrates complexity theory, duplication detection, and graph-theoretic analysis to quantify maintainability and structural soundness.

The system computes:

- **Maintainability Index (MI)**: from Halstead metrics, Cyclomatic Complexity, and SLOC.
- **Cyclomatic Complexity (CC)**: based on control flow graphs.
- **Duplication Score**: Rabin–Karp fingerprinting via jscpd.
- **Modularity (Q)**: Louvain community detection.
- **Centrality**: degree and betweenness metrics on the call graph.
- **Coupling Metrics**: using static dependency extraction.

---

## 📥 Installation

```bash
# choose one package manager
pnpm add -D code-health-meter
yarn add -D code-health-meter
npm i -D code-health-meter
```

### Prerequisites

- Node.js ≥ 18.x
- (Optional for SVG export) **Graphviz**  
  macOS: `brew install graphviz` • Debian/Ubuntu: `sudo apt install graphviz`

---

## ⚡ Quick Start (no install vs local install)

> **Why two ways?**  
> • **One‑off runs**: use *npx* (npm) or *dlx* (pnpm) to download & execute temporarily.  
> • **Local runs**: install the package, then use *exec* (pnpm) or *npx* (npm) so the binary resolves from your workspace.

### One‑off (no install)

```bash
# npm
npx code-health-meter --srcDir "./tests/mock-project" --outputDir "./tests/output" --format html

# pnpm (equivalent of npx)
pnpm dlx code-health-meter --srcDir "./tests/mock-project" --outputDir "./tests/output" --format html
```

### After installing locally

```bash
# pnpm
pnpm exec code-health-meter --srcDir "./tests/mock-project" --outputDir "./tests/output" --format html

# npm
npx code-health-meter --srcDir "./tests/mock-project" --outputDir "./tests/output" --format html
```

> **Heads‑up (pnpm):** `pnpm code-health-meter` is **not** a CLI invocation; pnpm treats that as a script name.  
> Use `pnpm dlx …` (no install) or `pnpm exec …` (after installing).

**Supported formats:** `html`, `json`, or `html,json` for both.

---

## 🚦 CLI Usage (copy‑paste)

```bash
# One‑off
npx  code-health-meter --srcDir "./tests/mock-project" --outputDir "./tests/output" --format html
pnpm dlx code-health-meter --srcDir "./tests/mock-project" --outputDir "./tests/output" --format html

# Installed locally
pnpm exec code-health-meter --srcDir "./tests/mock-project" --outputDir "./tests/output" --format html
```
> Tip (scripts): add `"scan": "code-health-meter --srcDir ./tests/mock-project --outputDir ./tests/output --format html"` and run `pnpm run scan` / `yarn run scan` / `npm run scan`.

---

## 📊 Reproducing the TOSEM Paper Results

To replicate the analysis presented in the paper:

```bash
git clone https://github.com/helabenkhalfallah/code-health-meter.git
cd code-health-meter
pnpm install
pnpm run scan --srcDir "./tests/mock-project" --outputDir "./tests/output" --format html
```

### Output:

📂 `tests/mock-json-scan/`
- `code-complexity-audit/CodeComplexityReport.json`
- `code-modularity-audit/CodeModularityReport.json`
- `code-modularity-audit/CodeModularityReport.svg`
- `code-duplication-audit/jscpd-report.json`

📂 `tests/mock-html-scan/`
- `code-complexity-audit/CodeComplexityReport.html`
- `code-modularity-audit/CodeModularityReport.html`
- `code-duplication-audit/html/index.html`
- Additional styled UI in `styles/` and `js/`

> Note on Scale and Reproducibility: The included tests/mock-project is a simplified version intended for demonstration and functional validation of the Code Health Meter (CHM) framework. The original system evaluated in the TOSEM paper comprises approximately 14,000 lines of JavaScript/TypeScript code across 221 modules. Due to size and licensing constraints, that full system is not distributed as part of this artifact. However, the provided mock-project, along with the structured output reports, fully reproduces the CHM analysis pipeline, including complexity metrics, duplication detection, and graph-based modularity assessments.

---

## 📦 Repository Structure

- `src/` – CHM analysis kernel (complexity, modularity, duplication)
- `cli/` – Command-line interface
- `tests/mock-project/` – Evaluation system from TOSEM study
- `tests/mock-json-scan/` – Machine-readable output (JSON, SVG)
- `tests/mock-html-scan/` – Human-readable dashboard (HTML, CSS)

---

## 🧩 Reusable APIs (Programmatic)

> **Analyzed entries vs raw files**: per-metric builders operate on **analyzed entries** produced by a single `inspectDirectory()` pass (not on raw file paths). The term _entries_ is used below to make this explicit.

### Complexity — per-metric builders

```js
// src/kernel/complexity/CodeComplexityMetrics.js
import {
  buildMaintainabilityReports,  // MI
  buildSLOCReports,             // SLOC
  buildCyclomaticReports,       // CC
  buildHalsteadMetricReports    // Halstead
} from "./src/kernel/complexity/CodeComplexityMetrics.js";

// entries: array produced by a single inspectDirectory() pass
const reports = [
  ...buildMaintainabilityReports(entries),
  ...buildSLOCReports(entries),
  ...buildCyclomaticReports(entries),
  ...buildHalsteadMetricReports(entries),
];
```

**Full complexity report (composer):**

```js
// src/kernel/complexity/CodeComplexityBuilder.js
import { buildFullComplexityReport } from "./src/kernel/complexity/CodeComplexityBuilder.js";

const { summary, auditReports } = buildFullComplexityReport({
  entries,                              // from inspectDirectory()
  metricIds: ["mi","sloc","cyclo","hal"],
  summaryBase,                          // aggregates you already computed
  buildAuditStats,                      // categorization helper
});
```

**Producing analyzed entries:**

```js
// src/kernel/complexity/CodeComplexityUtils.js
import { inspectDirectory } from "./src/kernel/complexity/CodeComplexityUtils.js";

const { summary, files: entries } = inspectDirectory({
  srcDir: "./tests/mock-project",
  options: {/* parser / analyzer options */}
});
```

### Modularity — graph metrics

```js
// src/kernel/modularity/CodeModularityUtils.js, CodeModularityMetrics.js
import {
  buildDirectoryTree,     // Madge: obj() + svg()
  buildLouvainGraph,      // Graphology graph (directed)
} from "./src/kernel/modularity/CodeModularityUtils.js";
import {
  detectCommunities,      // Louvain communities + modularity
  readDensity,
  readDegreeCentralities
} from "./src/kernel/modularity/CodeModularityMetrics.js";

const { tree, treeVisualization } = await buildDirectoryTree(".");
const graph = await buildLouvainGraph(tree, treeVisualization);

const { modularity, communities } = detectCommunities(graph);
const { density } = readDensity(graph);
const { degreeCentrality, inDegreeCentrality, outDegreeCentrality } = readDegreeCentralities(graph);
```

### Duplication — CLI + JSON output

The duplication auditor uses **jscpd** and writes JSON/HTML to `code-duplication-audit/`. Programmatic consumption can read and parse `jscpd-report.json`:

```js
import fs from "fs";

const dup = JSON.parse(
  fs.readFileSync("./tests/output/code-duplication-audit/jscpd-report.json", "utf8")
);

console.log("clones:", dup.total?.clones || dup.statistics?.total?.clones);
```

**Duplication — fixed reproducibility**  
✅ In `tests/mock-project`, CHM identifies **1 clone of 6 lines**, matching the expected test results.

---

## 🔍 Notes on Determinism & Reproducibility

- Dependency graph is **directed** by default; centralities computed accordingly
- Louvain (Graphology) provides stable results for a fixed toolchain
- CHM favors a **single‑pass** complexity pipeline (compute once, reuse entries)

---

## 🧯 Troubleshooting

- **pnpm: `Command "code-health-meter" not found`**  
  Use `pnpm dlx code-health-meter …` (no install) or `pnpm exec code-health-meter …` (after `pnpm add -D code-health-meter`).

- **Missing SVGs**  
  Install Graphviz (`brew install graphviz` or `apt install graphviz`), or run with `--format json` if SVGs aren’t needed.

- **No outputs produced**  
  Ensure `--outputDir` exists or is creatable; CHM creates it and writes:  
  `CodeComplexityReport.{html|json}`, `CodeModularityReport.{html|json|svg}`, `code-duplication-audit/…`.

---

## 🤝 Contributing

```bash
git clone https://github.com/helabenkhalfallah/code-health-meter.git
cd code-health-meter
pnpm install
pnpm run scan --srcDir "./tests/mock-project" --outputDir "./tests/output" --format html,json
```

---

## 📝 Response to Reviewers (TOSEM 2025 RCR)

- **Functional**: Clarified pnpm usage (`dlx`/`exec`) to eliminate “command not found”.
- **Reproducibility**: Duplication detection now deterministic (1 clone / 6 lines in `tests/mock-project`).
- **Reusable**: Exposed Cyclomatic & Halstead builders as public APIs; added guidance on analyzed entries.

---

## 📚 Citation

```bibtex
@article{benkhalfallah2025chm,
  author    = {Héla Ben Khalfallah},
  title     = {Code Health Meter: A Quantitative and Graph-Theoretic Foundation for Automated Code Quality and Architecture Assessment},
  journal   = {ACM Transactions on Software Engineering and Methodology (TOSEM)},
  year      = {2025},
  note      = {To appear},
}
```

---

## 📜 License

Licensed under the MIT License. See the [LICENSE](./LICENSE) file.
