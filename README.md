# 📊 Code Health Meter

## 📖 Table of Contents

1. [📢 Presentation](#-presentation)
2. [⚙️ Installation and Usage](#️-installation-and-usage)
3. [🤝 Contributing](#-contributing)
4. [📜 License](#-license)

---

## 📢 Presentation

**Code Health Meter** is a **powerful and intelligent tool** 🧠 designed to analyze and enhance code quality. It evaluates key software metrics such as:

- **Maintainability** 🔄 – How easy the code is to update and extend.  
- **Complexity** 🔍 – Measures the difficulty of understanding and modifying the code.  
- **Duplication** 🔁 – Detects repeated code blocks that can be optimized.  
- **Coupling** 🔗 – Analyzes dependencies between modules to assess modularity.  

By leveraging well-established methodologies, including **Halstead Metrics, Cyclomatic Complexity, Maintainability Index, and Graph-Based Metrics**, this tool helps developers **identify potential risks** ⚠️ and **refactoring opportunities** ✨ in their codebase.

### 🚀 Key Features:

- **Quantitative Code Quality Analysis** – Uses mathematical models to assess maintainability, difficulty, and potential bugs.  
- **Cyclomatic Complexity Calculation** – Evaluates control flow to determine function complexity.  
- **Maintainability Index Assessment** – Provides insights into how easy the code is to maintain and extend.  
- **Code Duplication Detection** – Implements the **Rabin–Karp algorithm** to identify redundant code blocks.  
- **Graph-Based Software Metrics** – Analyzes dependencies and modularity using **Louvain Communities** and centrality measures.  
- **Automated Report Generation** – Outputs results in **JSON and HTML formats** for easy visualization.  

---

## ⚙️ Installation and Usage

### 📌 Prerequisites
Before installing **Code Health Meter**, make sure you have the following dependencies installed:

- **Node.js** 🌐 – Required for running the tool.
- **Graphviz** 📈 – Needed for graph-based analysis. (On macOS, install via `brew install graphviz` or `port install graphviz`)

### 📥 Installation
Install **Code Health Meter** as a development dependency:

```sh
npm i -D code-health-meter
```

### 🚦 Running the Analysis
To analyze a project, run:

```sh
npx code-health-meter --srcDir "../../my-path" --outputDir "../../my-output-path" --format "json or html"
```

After execution, you will find all generated reports inside the specified `outputDir`.  

📂 **Example Reports:** A sample project analysis with JSON and HTML reports is available in the `tests` folder.

---

## 🤝 Contributing

We welcome contributions! 🎉 If you'd like to improve **Code Health Meter**, follow these steps:

1. **Fork the repository and clone it locally:**
    ```sh
    git clone https://github.com/helabenkhalfallah/code-health-meter.git
    cd code-health-meter
    ```

2. **Install dependencies:**
    ```sh
    npm install
    ```

3. **Run a local analysis:**
    ```sh
    npm run scan --srcDir "../../my-path" --outputDir "../../my-output-path" --format "json or html"
    ```

   **Using PNPM?** No problem! 🚀
    ```sh
    pnpm scan --srcDir "../../my-path" --outputDir "../../my-output-path" --format "json or html"
    ```

---

## 📜 License

This project is licensed under the **MIT License** 📄. See the [LICENSE](LICENSE) file for details.

---

### ❓ Need Help?

💬 If you encounter any issues or have questions, feel free to open an [issue](https://github.com/helabenkhalfallah/code-health-meter/issues) or start a discussion in the repository! 🚀
