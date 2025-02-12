# Code Health Meter

## Table of Contents

1. [Presentation](#presentation)
2. [Installation and Usage](#installation-and-usage)
3. [Contributing](#contributing)
4. [License](#license)

## Presentation

**Code Health Meter** is a powerful tool for analyzing and improving code quality. It evaluates various software metrics, including **maintainability, complexity, duplication, and coupling**, using advanced computational techniques.

By leveraging well-established methodologies such as **Halstead Metrics, Cyclomatic Complexity, Maintainability Index, and Graph-Based Metrics**, this tool helps developers identify potential risks and refactoring opportunities in their codebase.

### Key Features:
- **Quantitative Code Quality Analysis**: Uses mathematical models to assess code maintainability, difficulty, and potential bugs.
- **Cyclomatic Complexity Calculation**: Evaluates control flow to determine the complexity of functions.
- **Maintainability Index Assessment**: Provides insights into how easy the code is to maintain and extend.
- **Code Duplication Detection**: Implements the **Rabin–Karp algorithm** to detect redundant code blocks.
- **Graph-Based Software Metrics**: Analyzes dependencies and modularity using **Louvain Communities** and centrality measures.
- **Automated Report Generation**: Outputs results in **JSON and HTML formats** for easy visualization.

## Installation and Usage

### Prerequisites
Before installing **Code Health Meter**, ensure that you have:
- **Node.js** installed
- **Graphviz** installed (for graph-related analysis on macOS, install using `brew install graphviz` or `port install graphviz`).

### Installation
To install Code Health Meter as a development dependency, run:
```sh
npm i -D code-health-meter
```

### Running the Analysis
To analyze a project, use:
```sh
npx code-health-meter --srcDir "../../my-path" --outputDir "../../my-output-path" --format "json or html"
```

After execution, you will find all generated reports inside the `outputDir`.

An example of project, json report and html report can be found in the `tests` folder.

## Contributing

We welcome contributions! Follow these steps to get started:

1. **Clone the repository:**
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
   **or using PNPM:**
    ```sh
    pnpm scan --srcDir "../../my-path" --outputDir "../../my-output-path" --format "json or html"
    ```

## License

This project is licensed under the **MIT License**. See the [LICENSE](LICENSE) file for more details.

---

### Need Help?
If you encounter any issues or have questions, feel free to open an [issue](https://github.com/helabenkhalfallah/code-health-meter/issues) or start a discussion in the repository!
