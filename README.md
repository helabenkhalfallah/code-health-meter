[![DOI](https://zenodo.org/badge/DOI/10.5281/zenodo.15501897.svg)](https://doi.org/10.5281/zenodo.15501897)
[![npm version](https://img.shields.io/npm/v/code-health-meter.svg?color=blue)](https://www.npmjs.com/package/code-health-meter)

# 📊 Code Health Meter

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
pnpm install -D code-health-meter
yarn install -D code-health-meter
npm install -D code-health-meter
```

### Prerequisites

- Node.js ≥ 18.x
- Graphviz (e.g., `brew install graphviz` or `apt install graphviz`)

---

## ⚡ Quick Start

```bash
npx code-health-meter --srcDir "./tests/mock-project" --format json
```

✅ Generates `CodeComplexityReport.json`, `CodeModularityReport.json`, and `jscpd-report.json` under `tests/output/`.

---

## 🚦 CLI Usage

Run the tool with:

```bash
npx code-health-meter   --srcDir "./tests/mock-project"   --outputDir "./tests/output"   --format html
pnpm code-health-meter  --srcDir "./tests/mock-project"   --outputDir "./tests/output"   --format html
```

Supported formats: `html`, `json`, or both.

---

## 📊 Reproducing the TOSEM Paper Results

To replicate the analysis presented in the paper:

```bash
git clone https://github.com/helabenkhalfallah/code-health-meter.git
cd code-health-meter
pnpm install
pnpm scan --srcDir "./tests/mock-project" --outputDir "./tests/output" --format html
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

#### Duplication — Fixed Reproducibility

The duplication module now correctly detects cloned code.  
✅ In the `tests/mock-project`, CHM identifies **1 clone of 6 lines**, matching the expected test results.

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

## 🔍 Notes on Determinism & Reproducibility

- The dependency graph is **directed** by default; centralities are computed on this directed graph.
- Louvain community detection is provided by Graphology; results are stable for a given codebase and toolchain.
- CHM favors a **single-pass** pipeline for complexity (compute once, reuse entries across metrics).

---

## 🤝 Contributing

```bash
git clone https://github.com/helabenkhalfallah/code-health-meter.git
cd code-health-meter
pnpm install
```

Run:

```bash
pnpm scan --srcDir "./tests/mock-project" --outputDir "./tests/output" --format html,json
```

---

## 📝 Response to Reviewers (TOSEM 2025 RCR)

- **Functional Badge**: Fixed duplication detection reproducibility (1 clone of 6 lines detected in `tests/mock-project`).
- **Reusable Badge**: Exposed Cyclomatic Complexity and Halstead metrics as reusable functions. Documented rationale for metrics embedded in higher-level modules.
- **Documentation**: Expanded test instructions, clarified programmatic APIs, and detailed reproducibility notes.

---

## 📜 License

Licensed under the MIT License. See the [LICENSE](./LICENSE) file.
