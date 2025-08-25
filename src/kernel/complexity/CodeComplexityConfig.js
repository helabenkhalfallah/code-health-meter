import Matcher from '../../commons/Matcher.js';

/**
 * Format Html Complexity Reports
 * @param {object} summary - The audit summary
 * @param {Object} reports - The reports grouped by file
 * @returns {string} - The html report
 */
export const formatCodeComplexityHtmlReport = ({ summary, reports }) => {
    const codeComplexityReport = { summary, reports };

    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Code Quality Report</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .container { max-width: 900px; margin: auto; }
        .section { margin-bottom: 20px; padding: 10px; border: 1px solid #ccc; border-radius: 5px; }
        .toggle { cursor: pointer; color: blue; text-decoration: underline; }
        .hidden { display: none; }
        .search { margin-bottom: 10px; padding: 5px; width: 98%; }
        table { width: 100%; border-collapse: collapse; }
        th, td { padding: 8px; border: 1px solid #ddd; text-align: left; }
        th { background-color: #f4f4f4; }
        .help { font-size: 14px; color: gray; margin-top: 8px; }
    </style>
</head>
<body>
    <div class="container">
        <h1>Code Quality Report</h1>
        <div class="section">
            <h2>Summary</h2>
            <p><strong>Average Physical SLOC:</strong> <span id="avg-psloc"></span></p>
            <p><strong>Average Logical SLOC:</strong> <span id="avg-lsloc"></span></p>
            <p><strong>Average Maintainability:</strong> <span id="avg-maintainability"></span></p>
            
            <hr>
            <span class="help">- Physical SLOC: Number of lines in source code (including comment lines and sometimes blank lines).<br></span>
            <span class="help">- Logical SLOC: Number of lines that will be executed (executable statements).<br></span>
            <span class="help">- Maintainability: A measure designed to track maintainability and indicate when it becomes less costly or less risky to rewrite the code instead of modifying it.<br></span>
        </div>
        
        <input type="text" class="search" placeholder="Search files..." id="search">
        
        <div class="section">
            <h2>File Reports</h2>
            <div id="reports"></div>
        </div>
    </div>
    
    <script>
        const codeComplexityReport = ${JSON.stringify(codeComplexityReport, null, 2)};

        // Fill summary data
        if (codeComplexityReport?.summary?.average) {
            document.getElementById("avg-psloc").textContent = codeComplexityReport.summary.average.psloc;
            document.getElementById("avg-psloc").textContent += ' physical statements';
            
            document.getElementById("avg-lsloc").textContent = codeComplexityReport.summary.average.lsloc;
            document.getElementById("avg-lsloc").textContent += ' logical statements';
            
            document.getElementById("avg-maintainability").textContent = codeComplexityReport.summary.average.maintainability;
            document.getElementById("avg-maintainability").textContent += ' %';
        }

        // Populate File Reports
        if (codeComplexityReport?.reports && Object.keys(codeComplexityReport.reports).length !== 0) {
            const reportsDiv = document.getElementById("reports");

            Object.entries(codeComplexityReport.reports).forEach(([file, metrics]) => {
                const fileDiv = document.createElement("div");
                fileDiv.classList.add("section");

                // Create file header with toggle button
                const fileHeader = document.createElement("h3");
                fileHeader.textContent = file;
                const toggleSpan = document.createElement("span");
                toggleSpan.className = "toggle";
                toggleSpan.textContent = "▶ ";
                fileHeader.prepend(toggleSpan);
                fileHeader.onclick = function () {
                    const details = fileDiv.querySelector(".details");
                    details.classList.toggle("hidden");
                    this.querySelector(".toggle").textContent = details.classList.contains("hidden") ? "▶" : "▼";
                };
                fileDiv.appendChild(fileHeader);

                // Create details section with metrics table
                const detailsDiv = document.createElement("div");
                detailsDiv.classList.add("details", "hidden");

                const table = document.createElement("table");
                table.innerHTML = \`<tr><th>Metric</th><th>Score</th></tr>\`;
                metrics.forEach(metric => {
                    const row = document.createElement("tr");
                    row.innerHTML = \`<td>\${metric.title}</td><td>\${metric.score}</td>\`;
                    table.appendChild(row);
                });
                detailsDiv.appendChild(table);
                fileDiv.appendChild(detailsDiv);

                reportsDiv.appendChild(fileDiv);
            });

            // Implement Search Feature
            document.getElementById("search").addEventListener("input", function () {
                const searchText = this.value.toLowerCase();
                document.querySelectorAll(".section h3").forEach(h3 => {
                    h3.parentElement.style.display = h3.textContent.toLowerCase().includes(searchText) ? "block" : "none";
                });
            });
        }
    </script>
</body>
</html>`;
};

/**
 * Format Halstead Metrics Reports
 * @param {object} halsteadMetrics
 * @param {string} file
 * @return {*[]}
 */
export const formatHalsteadReports = (halsteadMetrics, file) => {
    const { bugs, difficulty, effort, length, time, volume } = halsteadMetrics || {};

    const halsteadReports = [];

    if (length) {
        halsteadReports.push({
            type: 'code-complexity',
            category: 'halstead',
            title: 'Program Length (N)',
            description:
                'Program Length (N): A higher number indicates a longer and potentially more complex program.',
            status: null,
            scoreMax: 0,
            scoreMin: 0,
            score: length,
            scorePercent: null,
            scoreUnit: '',
            file,
        });
    }

    if (volume) {
        halsteadReports.push({
            type: 'code-complexity',
            category: 'halstead',
            title: 'Program Volume (V)',
            description:
                'Program Volume (V): A higher volume means the program contains more information, which can make the program more difficult to understand and maintain.',
            status: null,
            scoreMax: 0,
            scoreMin: 0,
            score: volume,
            scorePercent: null,
            scoreUnit: 'bit',
            file,
        });
    }

    if (difficulty) {
        halsteadReports.push({
            type: 'code-complexity',
            category: 'halstead',
            title: 'Difficulty Level (D)',
            description:
                'Difficulty Level (D): A higher difficulty level means the program is more likely to contain errors. A lower number is preferable.',
            status: null,
            scoreMax: 0,
            scoreMin: 0,
            score: difficulty,
            scorePercent: null,
            scoreUnit: '',
            file,
        });
    }

    if (effort) {
        halsteadReports.push({
            type: 'code-complexity',
            category: 'halstead',
            title: 'Implementation Effort (E) or Understanding',
            description:
                'Implementation Effort (E): A higher effort means the program requires more work to be implemented. A lower number is preferable.',
            status: null,
            scoreMax: 0,
            scoreMin: 0,
            score: effort,
            scorePercent: null,
            scoreUnit: 'bit',
            file,
        });
    }

    if (bugs) {
        halsteadReports.push({
            type: 'code-complexity',
            category: 'halstead',
            title: 'Number of estimated bugs in a module or function (B)',
            description:
                'Number of bugs provided (B): A higher number means the program is likely to contain more errors. A lower number is preferable.',
            status: null,
            scoreMax: 0,
            scoreMin: 0,
            score: bugs,
            scorePercent: null,
            scoreUnit: '',
            file,
        });
    }

    if (time) {
        halsteadReports.push({
            type: 'code-complexity',
            category: 'halstead',
            title: 'Time (T) to implement or understand the program',
            description:
                'Time to implement (T): A longer time means the program takes longer to implement. A lower number is preferable.',
            status: null,
            scoreMax: 0,
            scoreMin: 0,
            score: time,
            scorePercent: null,
            scoreUnit: 's',
            file,
        });
    }

    return halsteadReports;
};

/**
 * Format Cyclomatic Complexity Report
 * @param {number} cyclomaticMetric
 * @param {string} file
 * @return {object}
 *
 * */
export const formatCyclomaticComplexityReport = (cyclomaticMetric, file) => {
    const complexityStatus = Matcher()
        .on(
            () => cyclomaticMetric <= 10,
            () => 'Low risk',
        )
        .on(
            () => cyclomaticMetric > 10 && cyclomaticMetric <= 20,
            () => 'Moderate risk',
        )
        .on(
            () => cyclomaticMetric > 20 && cyclomaticMetric <= 40,
            () => 'High risk',
        )
        .on(
            () => cyclomaticMetric > 40,
            () => 'Most complex and highly unstable',
        )
        .otherwise(() => '');

    return {
        type: 'code-complexity',
        category: 'cyclomatic',
        title: 'Cyclomatic Complexity',
        description: `Cyclomatic Complexity corresponds to the number of conditional branches in a program's flowchart (the number of linearly independent paths).
          The larger the cyclomatic number, the more execution paths there will be in the function, and the more difficult it will be to understand and test:
          - If the cyclomatic number is 1 to 10, then the code is structured, well written, highly testable, the cost and effort are less.
          - If the cyclomatic number is 10 to 20, the code is complex and moderately testable, and the cost and effort are medium.
          - If the cyclomatic number is 20 to 40, then the code is very complex and poorly testable, and the cost and effort are high.
          - If the cyclomatic number is > 40, it is not testable at all, and the cost and effort are very high.

The cyclomatic complexity report (or McCabe complexity report) presents the cyclomatic complexity (general measure of the solidity and reliability of a program) for the selected project entity.`,
        status: complexityStatus,
        scoreMax: 0,
        scoreMin: 0,
        score: cyclomaticMetric,
        scorePercent: null,
        scoreUnit: '',
        file,
    };
};

/**
 * Format MaintainabilityIndex report
 * @param {number} fileMaintainability
 * @param {string} file
 * @return {object}
 * */
export const formatMaintainabilityIndexReport = (fileMaintainability, file) => {
    const maintainabilityStatus = Matcher()
        .on(
            () => Math.round(fileMaintainability || 0) < 65,
            () => 'Low Maintainability',
        )
        .on(
            () => Math.round(fileMaintainability || 0) >= 85,
            () => 'High Maintainability',
        )
        .on(
            () =>
                Math.round(fileMaintainability || 0) >= 65 &&
                Math.round(fileMaintainability || 0) < 85,
            () => 'Moderate Maintainability',
        )
        .otherwise(() => '');

    return {
        type: 'code-complexity',
        category: 'maintainability',
        title: 'Maintainability Index IM (%)',
        description: `The maintainability index is a measure designed to track maintainability and indicate when it becomes less costly or less risky to rewrite the code instead of modifying it.
    - 85 and above: good maintainability.
    - 65–85: moderate maintainability.
    - < 65: difficult to maintain.
    The maintainability index is calculated using the following formula:
    171 - 5.2 * ln(Halstead Volume) - 0.23 * (Cyclomatic Complexity) - 16.2 * ln(Number of statements)
    - V represents the Halstead Volume.
    - N represents the length of the program.
    - n represents the size of the dictionary.
       
The maintainability index report presents the maintainability, McCabe and Halstead measures combined for the current project.`,
        status: maintainabilityStatus,
        scoreMax: 100,
        scoreMin: 0,
        score: null,
        scorePercent: fileMaintainability,
        scoreUnit: '%',
        file,
    };
};

/**
 * This function formats the Source Lines of Code (SLOC) indicators for a given file.
 *
 * @param {Object} fileSLOC - An object containing the physical and logical SLOC counts for the file.
 * @param {string} file - The name of the file.
 *
 * @returns {Array} codeSLOCIndicators - An array of objects, each representing a SLOC indicator for the file.
 * Each SLOC indicator object includes the type of SLOC ('code-sloc'), the category of SLOC (either 'physical sloc' or 'logical sloc'),
 * a title, a description, a status, the maximum and minimum scores (both set to 0), the actual score (either the physical or logical SLOC count),
 * a percentage score (null), a score unit (an empty string), and the file name.
 *
 * @example
 * const fileSLOC = {
 *   physical: 100,
 *   logical: 80
 * };
 * const file = 'example.js';
 * const indicators = formatFileSLOCIndicators(fileSLOC, file);
 * console.log(indicators);
 */
export const formatFileSLOCIndicators = (fileSLOC, file) => {
    const codeSLOCIndicators = [];

    if (fileSLOC && file) {
        codeSLOCIndicators.push({
            type: 'code-sloc',
            category: 'physical sloc',
            title: 'Number of lines in source code (physical SLOC)',
            description: `Physical SLOC is the total count of lines in the source code file, including comment lines and sometimes blank lines. It gives an idea of the total size of the codebase.
      - High SLOC: A high SLOC count can indicate that a program is large and potentially complex, which could mean it’s harder to maintain. However, a high SLOC count could also simply mean the program is large because it’s doing a lot of things.
      - Low SLOC: A low SLOC count can indicate that a program is small or potentially simplistic. This could mean it’s easier to maintain. However, a low SLOC count could also mean the program isn’t doing much, or it’s not doing it well.`,
            status: null,
            scoreMax: 0,
            scoreMin: 0,
            score: fileSLOC.physical || 0,
            scorePercent: null,
            scoreUnit: '',
            file,
        });
        codeSLOCIndicators.push({
            type: 'code-sloc',
            category: 'logical sloc',
            title: 'Number of lines that will be executed (logical SLOC)',
            description: `Logical SLOC measures the number of executable statements (like operators, functions, etc.) in the source code. It gives an idea of the complexity of the codebase.
      - High SLOC: A high SLOC count can indicate that a program is large and potentially complex, which could mean it’s harder to maintain. However, a high SLOC count could also simply mean the program is large because it’s doing a lot of things.
      - Low SLOC: A low SLOC count can indicate that a program is small or potentially simplistic. This could mean it’s easier to maintain. However, a low SLOC count could also mean the program isn’t doing much, or it’s not doing it well.`,
            status: null,
            scoreMax: 0,
            scoreMin: 0,
            score: fileSLOC.logical || 0,
            scorePercent: null,
            scoreUnit: '',
            file,
        });
    }

    return codeSLOCIndicators;
};
