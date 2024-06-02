import path from 'path';
import fs from 'fs-extra';
import AppLogger from '../../commons/AppLogger.js';
import AuditUtils from '../../commons/AuditUtils.js';
import CodeSecurityConfig from './CodeSecurityConfig.js';

const {
  getFiles,
  parseFile,
  isNonCompliantFile,
} = AuditUtils;

const {
  SECURITY_ANTI_PATTERNS_TOKENS,
  formatSecurityAuditReport,
  formatCodeSecurityHtmlReport,
} = CodeSecurityConfig;

/**
 * Inspects the source directory.
 * @param {Object} params - The parameters for the inspection.
 * @returns {Promise<*[]>} - Returns an object containing the overview report.
 */
const inspectDirectory = async ({
  srcDir,
  options,
}) => {
  try {
    AppLogger.info(`[CodeSecurityUtils - inspectDirectory] srcDir:  ${srcDir}`);

    const {
      files,
      basePath
    } = getFiles(srcDir);
    AppLogger.info(`[CodeSecurityUtils - inspectDirectory] files:  ${files?.length}`);
    AppLogger.info(`[CodeSecurityUtils - inspectDirectory] basePath:  ${basePath}`);

    if(!files?.length){
      return [];
    }

    const securityAuditReports = [];

    for (const file of files) {
      const report = parseFile(file, basePath, options);
      if(!report){
        continue;
      }

      const {
        source,
      } = report;
      AppLogger.info(`[CodeSecurityUtils - inspectDirectory] source:  ${source?.length}`);
      if(!source?.length){
        continue;
      }

      for (const antiPattern of SECURITY_ANTI_PATTERNS_TOKENS) {
        const nonCompliantStatus = await isNonCompliantFile(antiPattern, source);
        AppLogger.info(`[CodeSecurityUtils - inspectDirectory] nonCompliantStatus:  ${nonCompliantStatus}`);

        if (nonCompliantStatus !== true) {
          continue;
        }

        const securityAuditReport = formatSecurityAuditReport({
          fileName: file,
          antiPattern,
        });

        AppLogger.info(`[CodeSecurityUtils - inspectDirectory] securityAuditReport:  ${Object.keys(securityAuditReport || {}).join(',')}`);
        if (!securityAuditReport) {
          continue;
        }
          
        securityAuditReports.push(securityAuditReport);
      }
    }

    return securityAuditReports;
  } catch (error) {
    return [];
  }
};

/**
 * Groups code Security reports by file.
 * @param {Array} reports - The reports to group.
 * @returns {Object} - Returns an object with the reports grouped by file.
 */
const groupCodeSecurityReportsByFile = (reports) => reports?.reduce((acc, report) => ({
  ...acc,
  [report.file]: [
    ...(acc[report.file] || []),
    report,
  ],
}), {});

/**
 * Formats the audit reports.
 * @param {Array} auditReports - The audit reports to format.
 * @param {string} fileFormat - The format of the file.
 * @returns {string} - Returns a string with the formatted reports.
 */
const formatCodeSecurityAuditReports = ({
  auditReports,
  fileFormat,
}) => {
  const reportsByFile = groupCodeSecurityReportsByFile(auditReports);

  if(fileFormat === 'json'){
    return JSON.stringify({
      reports: reportsByFile,
    }, null, 2);
  }

  if(fileFormat === 'html'){
    return formatCodeSecurityHtmlReport(reportsByFile);
  }

  return '';
};

/**
 * This function writes the results of a code security audit to a file.
 *
 * @param {Object} codeSecurityOptions - The options for the code security audit.
 * @param {string} codeSecurityOptions.outputDir - The directory where the output file will be written.
 * @param {string} codeSecurityOptions.fileFormat - The format of the output file.
 * @param {Array} codeSecurityAnalysisResult - The results of the code security audit.
 * @returns {boolean} Returns true if the file was successfully written, false otherwise.
 * @throws Will log the error message if an error occurs.
 *
 * @example
 * const result = writeCodeSecurityAuditToFile({
 *   codeSecurityOptions: {
 *     outputDir: '/path/to/output/directory',
 *     fileFormat: 'json'
 *   },
 *   codeSecurityAnalysisResult: [...]
 * });
 * console.log(result); // Logs true if the file was successfully written, false otherwise.
 */
const writeCodeSecurityAuditToFile = ({
  codeSecurityOptions,
  codeSecurityAnalysisResult,
}) => {
  try{
    const {
      outputDir,
      fileFormat,
    } = codeSecurityOptions || {};

    AppLogger.info(`[CodeSecurityUtils - writeCodeSecurityAuditToFile] outputDir:  ${outputDir}`);
    AppLogger.info(`[CodeSecurityUtils - writeCodeSecurityAuditToFile] fileFormat:  ${fileFormat}`);

    if(!outputDir?.length){
      return false;
    }
    
    const codeSecurityAuditOutputFileName = `CodeSecurityReport.${fileFormat || 'json'}`;
    AppLogger.info(`[CodeSecurityUtils - writeCodeSecurityAuditToFile] codeSecurityAuditOutputFileName:  ${codeSecurityAuditOutputFileName}`);

    const codeSecurityAuditOutputFile = path.join(outputDir, codeSecurityAuditOutputFileName);
    AppLogger.info(`[CodeSecurityUtils - writeCodeSecurityAuditToFile] codeSecurityAuditOutputFile:  ${codeSecurityAuditOutputFile}`);

    if(fs.existsSync(codeSecurityAuditOutputFile)){
      fs.rmSync(codeSecurityAuditOutputFile);
    } else {
      fs.mkdirSync(outputDir, {
        recursive: true
      });
    }

    const formattedCodeSecurityAuditReports = formatCodeSecurityAuditReports({
      auditReports: codeSecurityAnalysisResult,
      fileFormat,
    });

    AppLogger.info(`[CodeSecurityUtils - writeCodeSecurityAuditToFile] formattedCodeSecurityAuditReports:  ${formattedCodeSecurityAuditReports?.length}`);

    if(!formattedCodeSecurityAuditReports?.length){
      return false;
    }

    fs.writeFileSync(codeSecurityAuditOutputFile, formattedCodeSecurityAuditReports);

    return true;
  } catch (error) {
    AppLogger.info(`[CodeSecurityUtils - writeCodeSecurityAuditToFile] error:  ${error.message}`);
    return false;
  }
};

const CodeSecurityUtils = {
  inspectDirectory,
  writeCodeSecurityAuditToFile,
};

export default CodeSecurityUtils;