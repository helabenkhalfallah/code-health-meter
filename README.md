# Code Health Meter

This repository contains a set of tools and utilities for analyzing the quality of JavaScript and TypeScript code. It uses various metrics and methodologies to provide a comprehensive overview of the code's complexity, maintainability, and other important aspects.

## Features

- **Code Complexity Analysis**: Analyze the cyclomatic complexity, Halstead complexity, and maintainability index of your code.
- **File Filtering**: Exclude specific files or directories from the analysis.
- **Customizable Reporting**: Generate detailed reports in various formats (JSON, HTML).


## More information about metrics

- **Cyclomatic Complexity**: 
Cyclomatic complexity is a software metric used to indicate the complexity of a program. 
It is a quantitative measure of the number of linearly independent paths through a program’s source code. You can read more about it on [Wikipedia](https://en.wikipedia.org/wiki/Cyclomatic_complexity).

- **Halstead Complexity**:
Halstead complexity measures are software metrics introduced by Maurice Howard Halstead in 1977 as part of his treatise on establishing an empirical science of software development. 
Halstead made the observation that metrics of the software should reflect the implementation or expression of algorithms in different languages, but be independent of their execution on a specific platform. 
You can read more about it on [Wikipedia](https://en.wikipedia.org/wiki/Halstead_complexity_measures).

- **Maintainability Index**: 
Maintainability Index is a software metric which measures how maintainable (easy to support and change) the source code is. 
The maintainability index is calculated as a factored formula consisting of SLOC (Source Lines Of Code), Cyclomatic Complexity and Halstead volume. 
It was originally developed by Oman & Hagemeister in the early 1990s. You can read more about it on [Wikipedia](https://learn.microsoft.com/en-us/visualstudio/code-quality/code-metrics-maintainability-index-range-and-meaning?view=vs-2022).


## Getting Started

1. Clone the repository:
    ```
    git clone https://github.com/helabenkhalfallah/CodeHealthMeter.git
    cd CodeHealthMeter
    ```

2. Install the dependencies:
    ```
    npm install
    ```

3. Run the analysis on your codebase:
    ```
    npm run analyze -- <your-source-directory>
    ```

## Contributing

Contributions are welcome! Please read the contributing guidelines before getting started.

## License

This project is licensed under the terms of the MIT license. See the LICENSE file for details.
