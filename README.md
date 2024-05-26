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

## Installation and usage

1. Install the dependencies:
    ```
    npm install
    ```

2. Run the analysis on your project:
    ```
    npm run code-health-meter --srcDir "../../my-path" --outputDir "../../my-output-path" --outputFile "OutputFileName" --format "json or html"
    ```

Or using `npx`:
   ```
   npx code-health-meter --srcDir "../../my-path" --outputDir "../../my-output-path" --outputFile "OutputFileName" --format "json or html"
   ```

Example of a JSON report:
```
{
  "summary": {
    "total": {
      "sloc": 5324180,
      "maintainability": 3650140.4030000097
    },
    "average": {
      "sloc": 107,
      "maintainability": "73.54"
    }
  },
  "reports": {
    "src/XX/FileName.ts": [
      {
        "title": "Maintainability Index IM (%)",
        "score": "49.12 %"
      },
      {
        "title": "Cyclomatic Complexity",
        "score": "11 "
      },
      {
        "title": "Program Length (N)",
        "score": "483 "
      },
      {
        "title": "Program Volume (V)",
        "score": "3236.31 bit"
      },
      {
        "title": "Difficulty Level (D)",
        "score": "26.91 "
      },
      {
        "title": "Implementation Effort (E) or Understanding",
        "score": "87086.22 bit"
      },
      {
        "title": "Number of estimated bugs in a module or function (B)",
        "score": "1.08 "
      },
      {
        "title": "Time (T) to implement or understand the program",
        "score": "4838.12 s"
      }
    ],
    "FileName.ts": [
      {
        "title": "Maintainability Index IM (%)",
        "score": "49.65 %"
      },
      {
        "title": "Cyclomatic Complexity",
        "score": "20 "
      },
      {
        "title": "Program Length (N)",
        "score": "540 "
      },
      {
        "title": "Program Volume (V)",
        "score": "3633.08 bit"
      },
      {
        "title": "Difficulty Level (D)",
        "score": "34.09 "
      },
      {
        "title": "Implementation Effort (E) or Understanding",
        "score": "123866.56 bit"
      },
      {
        "title": "Number of estimated bugs in a module or function (B)",
        "score": "1.21 "
      },
      {
        "title": "Time (T) to implement or understand the program",
        "score": "6881.48 s"
      }
    ],
    ...   
```

Example of an HTML report:
![HTML_REPORT_1](HTML_REPORT_1.png)

![HTML_REPORT_2](HTML_REPORT_2.png)

## Contributing

Contributions are welcome! Please read the contributing guidelines before getting started.

1. Clone the repository:
    ```
    git clone https://github.com/helabenkhalfallah/CodeHealthMeter.git
    cd CodeHealthMeter
    ```

2. Install the dependencies:
    ```
    npm install
    ```

3. To locally test the analysis you can run:
    ```
    npm run scan --srcDir "../../my-path" --outputDir "../../my-output-path" --outputFile "OutputFileName" --format "json or html"
    ```
    ```
    npx scan --srcDir "../../my-path" --outputDir "../../my-output-path" --outputFile "OutputFileName" --format "json or html"
    ```
   
## License

This project is licensed under the terms of the MIT license. See the LICENSE file for details.
