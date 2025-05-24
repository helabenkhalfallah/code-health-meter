# 📊 Code Health Meter

> **TOSEM 2025 Publication**  
> _Code Health Meter: A Quantitative and Graph-Theoretic Foundation for Automated Code Quality and Architecture Assessment_  
> 📄 [ACM TOSEM Paper – Coming Soon]

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
npm install -D code-health-meter
```

### Prerequisites

- Node.js ≥ 18.x
- Graphviz (e.g., `brew install graphviz` or `apt install graphviz`)

---

## 🚦 CLI Usage

Run the tool with:

```bash
npx code-health-meter   --srcDir "./tests/mock-project"   --outputDir "./tests/output"   --format html
```

Supported formats: `html`, `json`, or both.

---

## 📊 Reproducing the TOSEM Paper Results

To replicate the analysis presented in the paper:

```bash
git clone https://github.com/helabenkhalfallah/code-health-meter.git
cd code-health-meter
npm install
npm run scan --srcDir "./tests/mock-project" --outputDir "./tests/output" --format html,json
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

> Note: The included mock-project is a simplified codebase designed to demonstrate the Code Health Meter's analysis pipeline. The original system analyzed in the TOSEM paper contained ~14,000 SLOC across 221 modules and cannot be shared due to size and licensing constraints.

---

## 📦 Repository Structure

- `src/` – CHM analysis kernel (complexity, modularity, duplication)
- `cli/` – Command-line interface
- `tests/mock-project/` – Evaluation system from TOSEM study
- `tests/mock-json-scan/` – Machine-readable output (JSON, SVG)
- `tests/mock-html-scan/` – Human-readable dashboard (HTML, CSS)

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

## 🤝 Contributing

```bash
git clone https://github.com/helabenkhalfallah/code-health-meter.git
cd code-health-meter
npm install
```

Run:

```bash
npm run scan --srcDir "./tests/mock-project" --outputDir "./tests/output" --format html,json
```

---

## 📜 License

Licensed under the MIT License. See the [LICENSE](./LICENSE) file.
