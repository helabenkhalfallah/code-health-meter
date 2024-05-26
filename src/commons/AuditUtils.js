import fs from 'fs-extra';
import AppLogger from './AppLogger.js';
import CodeComplexityConfig from '../config/CodeComplexityConfig.js';

const {
 buildHtmlComplexityReports,
} = CodeComplexityConfig;

/**
 * Checks if a file is of an accepted type.
 * @param {string} fileName - The name of the file.
 * @returns {boolean} - Returns true if the file is of an accepted type, false otherwise.
 */
const isAcceptedFileType = (fileName) => (
    fileName?.endsWith('.js') ||
    fileName?.endsWith('.jsx') ||
    fileName?.endsWith('.ts') ||
    fileName?.endsWith('.tsx') ||
    false
);

/**
 * Checks if a file is excluded.
 * @param {string} filePath - The path of the file.
 * @returns {boolean} - Returns true if the file is excluded, false otherwise.
 */
const isExcludedFile = (filePath) => (
    filePath?.toLowerCase()?.includes('snap') ||
    filePath?.toLowerCase()?.includes('mock') ||
    filePath?.toLowerCase()?.includes('jest') ||
    filePath?.toLowerCase()?.includes('webpack') ||
    filePath?.toLowerCase()?.includes('public') ||
    filePath?.toLowerCase()?.includes('cypress') ||
    filePath?.toLowerCase()?.includes('gitlab') ||
    filePath?.toLowerCase()?.includes('deploy') ||
    filePath?.toLowerCase()?.includes('target') ||
    filePath?.toLowerCase()?.includes('node_modules') ||
    filePath?.toLowerCase()?.includes('report-complexity') ||
    filePath?.toLowerCase()?.includes('eslint') ||
    filePath?.toLowerCase()?.includes('babel') ||
    filePath?.toLowerCase()?.includes('husky') ||
    filePath?.toLowerCase()?.includes('postcss') ||
    filePath?.toLowerCase()?.includes('routes') ||
    filePath?.toLowerCase()?.includes('path') ||
    filePath?.toLowerCase()?.includes('dico') ||
    filePath?.toLowerCase()?.includes('redux') ||
    filePath?.toLowerCase()?.includes('/dist/') ||
    filePath?.toLowerCase()?.includes('/bff/') ||
    filePath?.toLowerCase()?.includes('/wsclient/') ||
    filePath?.toLowerCase()?.includes('/js/index.js') ||
    filePath?.toLowerCase()?.includes('/ts/index.ts') ||
    filePath?.toLowerCase()?.includes('test') ||
    filePath?.toLowerCase()?.includes('spec')  ||
    filePath?.toLowerCase()?.endsWith('.d.ts')  ||
    filePath?.toLowerCase()?.endsWith('.config.js')  ||
    filePath?.toLowerCase()?.endsWith('.config.ts')  ||
    false
);

/**
 * Groups reports by file.
 * @param {Array} reports - The reports to group.
 * @returns {Object} - Returns an object with the reports grouped by file.
 */
const groupReportsByFile = (reports) => reports?.reduce((acc, report) => ({
  ...acc,
  [report.file]: [
    ...(acc[report.file] || []),
    {
      title: report.title,
      score: `${report.score || report.scorePercent || 0} ${report.scoreUnit || ''}`,
      description: report.description,
    },
  ],
}), {});

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
        <td colspan="3">
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
 * Formats the audit reports.
 * @param {Array} auditReports - The audit reports to format.
 * @param {string} fileFormat - The format of the file.
 * @returns {string} - Returns a string with the formatted reports.
 */
const formatReports = (auditReports, fileFormat) => {
  const reportsByFile = groupReportsByFile(auditReports);

  if(fileFormat === 'json'){
    return JSON.stringify(reportsByFile, null, 2);
  }

  if(fileFormat === 'html'){
    const {
      tableHeaders,
      tableRows,
    } = buildTableHtmlData(reportsByFile);

    return buildHtmlComplexityReports(tableHeaders, tableRows);
  }

  return '';
};

/**
 * Writes the audit to a file.
 * @param {Array} auditReports - The audit reports to write.
 * @param {Object} options - The options for the file.
 * @returns {boolean} - Returns true if the audit was written to the file, false otherwise.
 */
const writeAuditToFile = (auditReports, options) => {
  try{
    if(!auditReports?.length){
      return false;
    }

    const {
      fileName,
      fileFormat,
    } = options || {};

    const outPutFileName = `${fileName || 'CodeQualityReport'}.${fileFormat || 'json'}`;

    if(fs.existsSync(outPutFileName)){
      fs.rmSync(outPutFileName);
    }

    fs.writeFileSync(outPutFileName, formatReports(auditReports, fileFormat));

    return true;
  } catch (error) {
    AppLogger.info(`[AuditUtils - writeAuditToFile] error:  ${error.message}`);
    return false;
  }
};

/**
 * The AuditUtils object.
 * @typedef {Object} AuditUtils
 * @property {function} isAcceptedFileType - Checks if a file is of an accepted type.
 * @property {function} isExcludedFile - Checks if a file is excluded.
 * @property {function} writeAuditToFile - Writes the audit to a file.
 */
const AuditUtils = {
  isAcceptedFileType,
  isExcludedFile,
  writeAuditToFile,
};

export default AuditUtils;
