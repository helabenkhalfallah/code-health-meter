import fs from 'fs-extra';
import AppLogger from './AppLogger.js';

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
      score: `${Number((report.score || report.scorePercent || 0).toFixed(2))} ${report.scoreUnit || ''}`,
    },
  ],
}), {});

/**
 * Formats the audit reports.
 * @param {object} summary - The audit summary
 * @param {Array} auditReports - The audit reports to format.
 * @param {string} fileFormat - The format of the file.
 * @param {function} htmlFormatter - The html report formatter
 * @returns {string} - Returns a string with the formatted reports.
 */
const formatReports = ({
  summary,
  auditReports,
  fileFormat,
  htmlReportFormatter,
}) => {
  const reportsByFile = groupReportsByFile(auditReports);

  if(fileFormat === 'json'){
    return JSON.stringify({
      summary,
      reports: reportsByFile,
    }, null, 2);
  }

  if(fileFormat === 'html' && htmlReportFormatter){
    const descriptions = [
      ...new Set(auditReports.map((report) => report.description) || [])
    ].map((description, index) => `${index + 1}) ${description}`) || [];
    return htmlReportFormatter(summary, descriptions, reportsByFile);
  }

  return '';
};

/**
 * Writes the audit to a file.
 * @param {object} summary - The audit summary
 * @param {Array} auditReports - The audit reports to write.
 * @param {Object} options - The options for the file.
 * @returns {boolean} - Returns true if the audit was written to the file, false otherwise.
 */
const writeAuditToFile = (summary, auditReports, options) => {
  try{
    if(!summary || !auditReports?.length){
      return false;
    }

    const {
      fileName,
      fileFormat,
      htmlReportFormatter,
    } = options || {};

    const outPutFileName = `${fileName || 'CodeQualityReport'}.${fileFormat || 'json'}`;

    if(fs.existsSync(outPutFileName)){
      fs.rmSync(outPutFileName);
    }

    fs.writeFileSync(outPutFileName, formatReports({
      summary,
      auditReports,
      fileFormat,
      htmlReportFormatter,
    }));

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
