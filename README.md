# Code Health Meter

# Table of Contents

1. [Presentation](https://github.com/helabenkhalfallah/code-health-meter/tree/main?tab=readme-ov-file#presentation)
2. [Installation and Usage](https://github.com/helabenkhalfallah/code-health-meter/tree/main?tab=readme-ov-file#installation-and-usage)
3. [Contributing](https://github.com/helabenkhalfallah/code-health-meter/tree/main?tab=readme-ov-file#contributing)
4. [License](https://github.com/helabenkhalfallah/code-health-meter/tree/main?tab=readme-ov-file#license)

## Presentation

**Code Health Meter** is a comprehensive tool designed to measure and monitor the health of a codebase. It provides a **quantitative evaluation (computational complexity)** of your code's maintainability, coupling, stability, duplication, complexity, and size using a variety of established software metrics.

> Halstead complexity measurement was developed to measure a program module's complexity directly from source code, with emphasis on computational complexity. The measures were developed by the late Maurice Halstead as a means of determining a quantitative measure of complexity directly from the operators and operands in the module. [IBM DevOps Test Embedded](https://www.ibm.com/docs/en/devops-test-embedded/9.0.0?topic=metrics-halstead).

Quantitative software quality analysis involves a mathematical approach to analyzing the source code and architecture of a software system. 
By applying formulas like the **Halstead metrics and the Maintainability Index**, we can obtain precise, objective measures of various aspects of the software’s quality:

---

1. **Operators and Operands**:
   - **n1**: Number of distinct operators.
   - **n2**: Number of distinct operands.
   - **N1**: Total number of operators.
   - **N2**: Total number of operands.

2. **Derived Metrics**:
   - **Vocabulary (n)**: n = n1 + n2
   - **Program Length (N)**: N = N1 + N2
   - **Volume (V)**: V = N * log2(n)
   - **Difficulty (D)**: D = (n1/2) * (N2/n2) 
   - **Effort (E)**:  E = V * D
   - **Time to Implement (T)**: 	T = E / k
   - **Number of Delivered Bugs (B)**: B = V / 3000
  
**Interpretation**:
- **Volume (V)**: Indicates the size of the implementation. Larger volumes suggest more complex code.
- **Difficulty (D)**: Measures the difficulty of writing or understanding the code. Higher values indicate more complex logic.
- **Effort (E)**: Represents the mental effort required. Higher values suggest more time-consuming code.
- **Number of Delivered Bugs (B)**: Estimates the number of errors. Higher values indicate a higher likelihood of bugs.

3. **Cyclomatic Complexity (CC)** is:

```
CC = E - N + 2P
```

**where**:
- \( E \) is the number of edges in the control flow graph.
- \( N \) is the number of nodes in the control flow graph.
- \( P \) is the number of connected components (usually 1 for a single program).

**Interpretation**:
- A lower Cyclomatic Complexity indicates simpler, more understandable code.
- Typically, a CC value of 10 or less is considered manageable, while higher values indicate more complex and potentially error-prone code.

4. **Maintainability Index (MI)** is:

```
MI= 171 − 5.2×log(V) − 0.23×CC −16.2×log(SLOC) + 50×sin(2.46×comments_ratio)
```

**where**:
- \( V \) is the Halstead Volume
- \( CC \) is the Cyclomatic Complexity
- \( SLOC \) is the Source Lines of Code
- \( comments\_ratio \) is the ratio of comment lines to the total lines of code

**Interpretation**:
- A higher MI value indicates more maintainable code.
- Typically, an MI value over 85 is considered good, between 65 and 85 is moderate, and below 65 is poor.

When analyzing a codebase, the tool might output metrics like this:
- **Vocabulary (n)**: 40
- **Program Length (N)**: 300
- **Volume (V)**: 1500
- **Difficulty (D)**: 30
- **Effort (E)**: 45000
- **Time to Implement (T)**: 2500 seconds
- **Number of Delivered Bugs (B)**: 15

From this, developers and managers can infer that the code is complex and may require significant effort to maintain or extend. 
Refactoring efforts can be prioritized on modules with the highest metrics to improve maintainability and reduce potential bugs.

Another example:
- **SLOC**: 5000
- **Cyclomatic Complexity (CC)**: 20
- **Maintainability Index (MI)**: 75

From this, developers and managers can infer that the codebase is moderately maintainable but has some areas of high complexity that may need attention to improve overall maintainability and reduce potential bugs.

5. **Coupling and Instability**:

- <strong>Afferent Coupling (Ca):</strong> This refers to the number of external modules that depend on the given module.
  It’s a measure of how much responsibility a module has. <br />
  <i>For instance, if you have a module A that provides utility functions used by modules B, C, and D, then the Afferent Coupling of module A is 3 (since three modules are depending on it).</i><br />
  <br />
- <strong>Efferent Coupling (Ce):</strong> This is the opposite of Afferent Coupling.
  It measures how many other modules a given module depends on.<br />
  <i>For example, if module A uses utility functions from modules B, C, and D, then the Efferent Coupling of module A is 3 (since it depends on three other modules).</i><br />
  <br />
- <strong>Instability Index:</strong> This is a measure of the module’s resilience to change, calculated as I = Ce / (Ca + Ce). <br />
  The range for this metric is 0 to 1. A value of 0 indicates a completely stable module (highly depended upon, but doesn’t depend on others), and a value of 1 indicates a completely unstable module (depends on many others, but isn’t depended upon). <br />
  <i>For instance, if module A has an Efferent Coupling of 3 and an Afferent Coupling of 1, its Instability Index would be I = 3 / (1 + 3) = 0.75, indicating it’s more unstable than stable.</i><br />
  <br />
  These metrics are useful in software design for understanding dependencies and the impact of potential changes. <br />
  They can help identify modules that might be problematic to maintain or evolve due to high coupling or instability.<br />

6. **Code Duplication Detection with Rabin–Karp Algorithm**

Code duplication is a common issue in software development that can lead to increased maintenance costs, bugs, and decreased readability. Detecting code duplication can help improve the health of your codebase.

One effective method for detecting code duplication is the **Rabin–Karp algorithm**. This is a string-searching algorithm that uses hashing to find any one of a set of pattern strings in a text. It has been proven to be very effective in detecting duplicate lines of code, even in large codebases.

The Rabin–Karp algorithm works by comparing the hash value of the pattern with the hash value of the current substring of the text. If the hash values match, it performs a direct comparison of the pattern with the substring. If the hash values do not match, it moves on to the next substring.

Here's a high-level overview of how the algorithm can be applied to detect code duplication:

a. **Preprocessing**: The source code is tokenized into a sequence of code tokens.

b. **Hashing**: Each code token is hashed using a rolling hash function. This allows for constant-time sliding window of the hash function.

c. **Pattern Matching**: The algorithm slides the pattern over the text one symbol at a time, checking the hash values at each step. If the hash values match, it checks for an exact match.

d. **Duplication Detection**: If an exact match is found, it indicates a duplicated block of code.

In **Code Health Meter**, we have utilized **[jscpd](https://github.com/kucherenko/jscpd)**, a code duplication detection tool that implements the Rabin-Karp algorithm. This allows us to automate the process of detecting code duplication, making it easier to maintain and improve the health of your codebase.

7. **Code Security Analysis**
**Code Health Meter** also incorporates code security analysis based on the recommendations from the Open Web Application Security Project (OWASP) and the Common Weakness Enumeration (CWE).

JavaScript code security analysis focuses on preventing Cross-Site Scripting (XSS) vulnerabilities, which can lead to account impersonation, observing user behavior, loading external content, stealing sensitive data, and more.

Security practices are guided by the [OWASP Top Ten Project](https://owasp.org/www-project-top-ten/), which provides a list of the most critical security risks to web applications. 

We also refer to the [CWE Top 25](https://cwe.mitre.org/top25/archive/2023/2023_top25_list.html) Most Dangerous Software Weaknesses to understand and mitigate common security risks.

For more details on preventing XSS vulnerabilities, you can refer to the following OWASP Cheat Sheets:
- [Cross-Site Scripting Prevention Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html)
- [DOM-based XSS Prevention Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/DOM_based_XSS_Prevention_Cheat_Sheet.html)
- [HTML Sanitization](https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html#html-sanitization)

8. **Graph Metrics and Their Significance for Software Quality**
In addition to the Halstead metrics and Maintainability Index, **CodeHealthMeter** also leverages various graph metrics to analyze the structure and dependencies within your codebase. 
These metrics provide valuable insights into the overall software quality and potential areas for improvement.

a. **Graph-Level Metrics**

- **projectDensity**: Offers a high-level overview of the project's complexity by quantifying the interconnectedness between modules. A high density often indicates a larger and more intricate system.
- **projectDegreeCentrality, projectInDegreeCentrality, projectOutDegreeCentrality**:
   - These metrics provide insights into the relative importance and dependencies of individual modules.
   - High degree centrality suggests a module plays a central role or has many connections.
   - High in-degree centrality implies a module is heavily relied upon by others.
   - High out-degree centrality indicates a module has many dependencies.
- **Louvain Communities**: Offers a visual representation of how modules are naturally grouped based on interaction patterns, providing insights into the system's modular structure and potential areas of high coupling or low cohesion.

---

This quantitative and mathematical approach provides a more precise and objective assessment of software quality compared to more subjective methods:
- **Peer Review**: This involves having one or more colleagues review your code. They can provide feedback on various aspects such as coding style, logic, and potential bugs. However, the feedback can vary greatly depending on the reviewer’s experience, knowledge, and personal preferences.
- **User Feedback**: Collecting feedback from users is another subjective method. Users can provide valuable insights into the usability and functionality of the software. However, user feedback can be highly subjective and may not always reflect the technical quality of the software.
- **Heuristic Evaluation**: This involves having a small set of evaluators examine the user interface against a list of heuristic principles (e.g., Nielsen’s Heuristics). It’s subjective as it heavily relies on the expertise of the evaluators.
- **Expert Opinion**: An expert in the field provides their assessment of the software quality. This can be beneficial due to the expert’s deep knowledge, but again, it’s subjective and can be influenced by personal bias.

While these methods can provide valuable insights, they lack the objectivity and precision of quantitative methods like Halstead metrics or cyclomatic complexity. 

**Therefore, a combination of both subjective and objective methods is often used in practice for a comprehensive evaluation of software quality.**

---

## Installation and usage

1. Install the dependencies:
    ```
    npm i -D code-health-meter
    ```
In macos you should install `graphiz`: 

    ```
    brew install graphviz || port install graphviz
    ```

2. Run the analysis on your project:
    ```
    npm run code-health-meter --srcDir "../../my-path" --outputDir "../../my-output-path" --format "json or html"
    ```

Or using `npx`:
   ```
   npx code-health-meter --srcDir "../../my-path" --outputDir "../../my-output-path" --format "json or html"
   ```

**You'll find all generated reports inside the `outputDir`.**

**Example of HTML reports:**

![HTML_REPORT_0](HTML_REPORT_0.png)

![HTML_REPORT_1](HTML_REPORT_1.png)

![HTML_REPORT_2](HTML_REPORT_2.png)

![HTML_REPORT_3](HTML_REPORT_3.png)

![HTML_REPORT_3_1](HTML_REPORT_3_1.png)

![HTML_REPORT_4](HTML_REPORT_4.png)

![HTML_REPORT_5](HTML_REPORT_5.png)

![HTML_REPORT_6](HTML_REPORT_6.png)

---

## Contributing

Contributions are welcome! Please read the contributing guidelines before getting started.

1. Clone the repository:
    ```
    git clone https://github.com/helabenkhalfallah/code-health-meter.git
    cd code-health-meter
    ```

2. Install the dependencies:
    ```
    npm install
    ```

3. To locally test the analysis you can run:
    ```
    npm run scan --srcDir "../../my-path" --outputDir "../../my-output-path" --format "json or html"
    ```
    ```
    npx scan --srcDir "../../my-path" --outputDir "../../my-output-path" --format "json or html"
    ```

---

## License

This project is licensed under the terms of the MIT license. See the LICENSE file for details.
