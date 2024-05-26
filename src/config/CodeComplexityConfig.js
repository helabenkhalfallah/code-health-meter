import Matcher from '../commons/Matcher.js';

/**
 * Format Halstead Metrics Reports
 * @param {object} halsteadMetrics
 * @param {string} file
 * @return {*[]}
 */
const formatHalsteadReports = (halsteadMetrics, file) => {
  const {
    bugs,
    difficulty,
    effort,
    length,
    time,
    volume,
  } = halsteadMetrics || {};

  const halsteadReports = [];

  if (length) {
    halsteadReports.push({
      type: 'code-complexity',
      category: 'halstead',
      title: 'Program Length (N)',
      description: 'Program Length (N): A higher number indicates a longer and potentially more complex program.',
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
      description: 'Program Volume (V): A higher volume means the program contains more information, which can make the program more difficult to understand and maintain.',
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
      description: 'Difficulty Level (D): A higher difficulty level means the program is more likely to contain errors. A lower number is preferable.',
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
      description: 'Implementation Effort (E): A higher effort means the program requires more work to be implemented. A lower number is preferable.',
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
      description: 'Number of bugs provided (B): A higher number means the program is likely to contain more errors. A lower number is preferable.',
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
      description: 'Time to implement (T): A longer time means the program takes longer to implement. A lower number is preferable.',
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
const formatCyclomaticComplexityReport = (cyclomaticMetric, file) => {
  const complexityStatus = Matcher()
      .on(() => cyclomaticMetric <= 10, () => 'Low risk')
      .on(() => cyclomaticMetric > 10 && cyclomaticMetric <= 20, () => 'Moderate risk')
      .on(() => cyclomaticMetric > 20 && cyclomaticMetric <= 40, () => 'High risk')
      .on(() => cyclomaticMetric > 40, () => 'Most complex and highly unstable')
      .otherwise(() => '');

  return ({
    type: 'code-complexity',
    category: 'cyclomatic',
    title: 'Cyclomatic Complexity',
    description: `Cyclomatic Complexity corresponds to the number of conditional branches in a program's flowchart (the number of linearly independent paths).<br /> 
          The larger the cyclomatic number, the more execution paths there will be in the function, and the more difficult it will be to understand and test:<br />
          - If the cyclomatic number is 1 to 10, then the code is structured, well written, highly testable, the cost and effort are less.<br />
          - If the cyclomatic number is 10 to 20, the code is complex and moderately testable, and the cost and effort are medium.<br />
          - If the cyclomatic number is 20 to 40, then the code is very complex and poorly testable, and the cost and effort are high.<br />
          - If the cyclomatic number is > 40, it is not testable at all, and the cost and effort are very high.<br />

The cyclomatic complexity report (or McCabe complexity report) presents the cyclomatic complexity (general measure of the solidity and reliability of a program) for the selected project entity.`,
    status: complexityStatus,
    scoreMax: 0,
    scoreMin: 0,
    score: cyclomaticMetric,
    scorePercent: null,
    scoreUnit: '',
    file,
  });
};

/**
 * Format MaintainabilityIndex report
 * @param {number} fileMaintainability
 * @param {string} file
 * @return {object}
 * */
const formatMaintainabilityIndexReport = (fileMaintainability, file) => {
  const maintainabilityStatus = Matcher()
      .on(() => Math.round(fileMaintainability || 0) < 65, () => 'Low Maintainability')
      .on(() => Math.round(fileMaintainability || 0) >= 85, () => 'High Maintainability')
      .on(() => (
          Math.round(fileMaintainability || 0) >= 65 &&
          Math.round(fileMaintainability || 0) < 85
      ), () => 'Moderate Maintainability')
      .otherwise(() => '');

  return ({
    type: 'code-complexity',
    category: 'maintainability',
    title: 'Maintainability Index IM (%)',
    description: `The maintainability index is a measure designed to track maintainability and indicate when it becomes less costly or less risky to rewrite the code instead of modifying it.<br />
    - 85 and above: good maintainability.<br />
    - 65–85: moderate maintainability.<br />
    - < 65: difficult to maintain.<br />
    The maintainability index is calculated using the following formula:<br />
    171 - 5.2 * ln(Halstead Volume) - 0.23 * (Cyclomatic Complexity) - 16.2 * ln(Number of statements)<br />
    - V represents the Halstead Volume.<br />
    - N represents the length of the program.<br />
    - n represents the size of the dictionary.<br />
       
The maintainability index report presents the maintainability, McCabe and Halstead measures combined for the current project.`,
    status: maintainabilityStatus,
    scoreMax: 100,
    scoreMin: 0,
    score: null,
    scorePercent: fileMaintainability,
    scoreUnit: '%',
    file,
  });
};

/**
 * Builds HTML data for a table.
 * @param {Object} reportsByFile - The reports grouped by file.
 * @returns {Object} - Returns an object with the table headers and rows.
 */
const buildTableHtmlData = (reportsByFile) => {
  const files = Object.keys(reportsByFile);

  const columnsNames = reportsByFile[files[0]][0];

  const tableHeaders = Object
      .keys(columnsNames)
      .map(key => `<th scope="col">${key}</th>`).join('\n');

  const buildReportRow = (report) => Object
      .keys(report)
      .map(key => `<td>${report[key]}</td>`)
      .join('\n');

  const buildReportsRows = (fileReports) => fileReports
      .map((report) => `
      <tr>
        ${buildReportRow(report)}
      </tr>`).join('\n');

  const tableRows = files
      .map(file => `
      <tr>
        <td colspan="2" class="text-center bg-primary-subtle">
           <strong>${file}</strong>
        </td>
      </tr>
      ${buildReportsRows(reportsByFile[file])}`)
      .join('\n');

  return({
    tableHeaders,
    tableRows,
  });
};

/**
 * Build Html Complexity Reports
 * @param {object} summary - The audit summary
 * @param {Array} descriptions - The audit report indicators descriptions
 * @param {Object} reportsByFile - The reports grouped by file..
 * @returns {string} - The html report
 */
const buildHtmlComplexityReports = (summary, descriptions, reportsByFile) => {
  const {
    tableHeaders,
    tableRows,
  } = buildTableHtmlData(reportsByFile);

  const {
    average,
  } = summary;

  return `
<!doctype html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Audit Reports</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-T3c6CoIi6uLrA9TneNEoa7RxnatzjcDSCmG1MXxSR1GAsXEV/Dwwykc2MPK8M2HN" crossorigin="anonymous">
</head>
<body class="font-monospace">
<h1 class="text-center mb-4 mt-4">Code Complexity Analysis</h1>
<div class="container text-center w-50">
    <article class="card">
        <div class="card-body mb-2 mt-2">
            <h2 class="card-title text-body-secondary mt-1">Global Status (Average)</h2>
            <p class="card-text text-start fs-5 mt-4">
                  <span class="text-primary-emphasis">
                  <strong>Source lines of code (SLOC):</strong> ${average?.sloc || 0}
                  </span>
                <br />
                <span class="text-primary-emphasis">
                  <strong>Maintainability:</strong> ${average?.maintainability || 0}%
                </span>
            </p>
            <div class="container text-end">
                <button
                        type="button"
                        class="btn btn-danger"
                        data-bs-toggle="modal"
                        data-bs-target="#helpMessage"
                >
                   More details about indicators
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-patch-question-fill" viewBox="0 0 16 16">
                        <path d="M5.933.87a2.89 2.89 0 0 1 4.134 0l.622.638.89-.011a2.89 2.89 0 0 1 2.924 2.924l-.01.89.636.622a2.89 2.89 0 0 1 0 4.134l-.637.622.011.89a2.89 2.89 0 0 1-2.924 2.924l-.89-.01-.622.636a2.89 2.89 0 0 1-4.134 0l-.622-.637-.89.011a2.89 2.89 0 0 1-2.924-2.924l.01-.89-.636-.622a2.89 2.89 0 0 1 0-4.134l.637-.622-.011-.89a2.89 2.89 0 0 1 2.924-2.924l.89.01zM7.002 11a1 1 0 1 0 2 0 1 1 0 0 0-2 0m1.602-2.027c.04-.534.198-.815.846-1.26.674-.475 1.05-1.09 1.05-1.986 0-1.325-.92-2.227-2.262-2.227-1.02 0-1.792.492-2.1 1.29A1.7 1.7 0 0 0 6 5.48c0 .393.203.64.545.64.272 0 .455-.147.564-.51.158-.592.525-.915 1.074-.915.61 0 1.03.446 1.03 1.084 0 .563-.208.885-.822 1.325-.619.433-.926.914-.926 1.64v.111c0 .428.208.745.585.745.336 0 .504-.24.554-.627"/>
                    </svg>
                </button>
            </div>            
        </div>
    </article>
</div>

<!-- Modal -->
<div class="modal fade" id="helpMessage" tabindex="-1" aria-labelledby="helpModalLabel" aria-hidden="true">
    <div class="modal-dialog modal-dialog-scrollable modal-lg">
        <div class="modal-content">
            <div class="modal-header">
                <h1 class="modal-title fs-5" id="helpModalLabel">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-patch-question-fill" viewBox="0 0 16 16">
                        <path d="M5.933.87a2.89 2.89 0 0 1 4.134 0l.622.638.89-.011a2.89 2.89 0 0 1 2.924 2.924l-.01.89.636.622a2.89 2.89 0 0 1 0 4.134l-.637.622.011.89a2.89 2.89 0 0 1-2.924 2.924l-.89-.01-.622.636a2.89 2.89 0 0 1-4.134 0l-.622-.637-.89.011a2.89 2.89 0 0 1-2.924-2.924l.01-.89-.636-.622a2.89 2.89 0 0 1 0-4.134l.637-.622-.011-.89a2.89 2.89 0 0 1 2.924-2.924l.89.01zM7.002 11a1 1 0 1 0 2 0 1 1 0 0 0-2 0m1.602-2.027c.04-.534.198-.815.846-1.26.674-.475 1.05-1.09 1.05-1.986 0-1.325-.92-2.227-2.262-2.227-1.02 0-1.792.492-2.1 1.29A1.7 1.7 0 0 0 6 5.48c0 .393.203.64.545.64.272 0 .455-.147.564-.51.158-.592.525-.915 1.074-.915.61 0 1.03.446 1.03 1.084 0 .563-.208.885-.822 1.325-.619.433-.926.914-.926 1.64v.111c0 .428.208.745.585.745.336 0 .504-.24.554-.627"/>
                    </svg>
                    <strong>More details about the various indicators</strong>
                </h1>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body">
                <div class="container mb-2 mt-2">
                   ${descriptions?.join('<br />') || ''}
                </div>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
            </div>
        </div>
    </div>
</div>

<div class="container text-left mb-4 mt-4">
  <div class="text-start">
    <table class="table table-striped table-responsive caption-top table-bordered border-primary-subtle">
      <caption>Analysis Details</caption>
      <thead class="table-light text-uppercase">
        <tr>
            ${tableHeaders}
        </tr>
      </thead>
      <tbody class="table-group-divider">
        ${tableRows}
      </tbody>
    </table>
  </div>
</div>
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js" integrity="sha384-C6RzsynM9kWDrMNeT87bh95OGNyZPhcTNXj1NW7RuBCsyN/o0jlpcV8Qyq46cDfL" crossorigin="anonymous"></script>
</body>
</html>
    `;
};

const CodeComplexityConfig ={
  formatHalsteadReports,
  formatMaintainabilityIndexReport,
  formatCyclomaticComplexityReport,
  buildHtmlComplexityReports,
};

export default CodeComplexityConfig;
