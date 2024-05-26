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
    description: `Cyclomatic Complexity corresponds to the number of conditional branches in a program's flowchart (the number of linearly independent paths).</br> 
          The larger the cyclomatic number, the more execution paths there will be in the function, and the more difficult it will be to understand and test:</br>
          - If the cyclomatic number is 1 to 10, then the code is structured, well written, highly testable, the cost and effort are less.</br>
          - If the cyclomatic number is 10 to 20, the code is complex and moderately testable, and the cost and effort are medium.</br>
          - If the cyclomatic number is 20 to 40, then the code is very complex and poorly testable, and the cost and effort are high.</br>
          - If the cyclomatic number is > 40, it is not testable at all, and the cost and effort are very high.</br>

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
    description: `The maintainability index is a measure designed to track maintainability and indicate when it becomes less costly or less risky to rewrite the code instead of modifying it.</br>
    - 85 and above: good maintainability.</br>
    - 65–85: moderate maintainability.</br>
    - < 65: difficult to maintain.</br>
    The maintainability index is calculated using the following formula:</br>
    171 - 5.2 * ln(Halstead Volume) - 0.23 * (Cyclomatic Complexity) - 16.2 * ln(Number of statements)</br>
    - V represents the Halstead Volume.</br>
    - N represents the length of the program.</br>
    - n represents the size of the dictionary.</br>
       
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
 * Build Html Complexity Reports
 * @param {string} tableHeaders
 * @param {string} tableRows
 * @return {string}
 * */
const buildHtmlComplexityReports = (tableHeaders, tableRows) => `
<!DOCTYPE html>
<html lang="en">
  <head>
   <meta http-equiv="Content-Type" 
      content="text/html; charset=utf-8">
      <title>Audit Reports</title>
        <style>
          body {
              margin-top: 2rem;
              margin-bottom: 2rem;
              font-family: sans-serif;
          }

          section {
            display: flex;
            align-items: center;
            justify-content: center;
          }

          h1 {
              font-family: sans-serif;
              font-size: 2rem;
              text-align: center;
          }

          table {
              width: 80%;
              border-collapse: collapse;
              border: 2px solid rgb(140 140 140);
              font-size: 0.9rem;
              letter-spacing: 1px;
          }

          caption {
              caption-side: bottom;
              padding: 10px;
              font-weight: bold;
          }

          thead,
          tfoot {
              background-color: darkblue;
              color: white;
              text-transform: uppercase;
          }

          th,
          td {
              border: 1px solid rgb(160 160 160);
              padding: 8px 10px;
          }

          td:last-of-type {
              text-align: center;
          }

          tbody > tr:nth-of-type(even) {
              background-color: rgb(237 238 242);
          }

          tfoot th {
              text-align: right;
          }

          table td:nth-child(2) {
             text-align: left;
          }

          table td:nth-child(3) {
              text-align: left;
          }

          tfoot td {
              font-weight: bold;
          }

          tbody>tr>td[colspan="3"] {
              background-color: lightblue;
              color: black;
              text-align: center;
          }
        </style>
  </head>
  <body>
   <h1>Code Complexity Analysis</h1>
   <section>
     <table id="audit-reports">
        <thead>
         <tr>
           ${tableHeaders}
         </tr>
        </thead>
        <tbody>
          ${tableRows}
        </tbody>
      </table>
    </section>
  </body>
 </html>
    `;

const CodeComplexityConfig ={
  formatHalsteadReports,
  formatMaintainabilityIndexReport,
  formatCyclomaticComplexityReport,
  buildHtmlComplexityReports,
};

export default CodeComplexityConfig;
