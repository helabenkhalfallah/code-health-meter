import fs from 'fs-extra';
import path from 'path';
import AppLogger from '../../commons/AppLogger.js';
import CodeCouplingConfig from './CodeCouplingConfig.js';

const {
  formatCodeCouplingHtmlReports,
} = CodeCouplingConfig;

/**
 * Formats the results of code coupling audit based on the specified file format.
 *
 * @param {Object[]} reports - The reports of the code coupling audit.
 * @param {Object[]} circular - The circular dependencies found in the audit.
 * @param {string} fileFormat - The format in which to output the results ('json' or 'html').
 * @returns {string} - Returns a string representation of the audit results in the specified format.
 */
const formatCodeCouplingAuditReports = ({
  reports,
  circularDependencies,
  svgFile,
  fileFormat,
}) => {
  if(fileFormat === 'json'){
    return JSON.stringify({
      reports,
      circularDependencies,
    }, null, 2);
  }

  if(fileFormat === 'html'){
    return formatCodeCouplingHtmlReports({
      reports,
      circularDependencies,
      svgFile,
    });
  }

  return '';
};

/**
 * Writes the results of code coupling audit to a file.
 *
 * @param {Object} codeCouplingOptions - The options for the code coupling audit.
 * @param {Object} codeCouplingAnalysisResult - The result of the code coupling audit.
 * @returns {boolean} - Returns true if the audit results were successfully written to file, false otherwise.
 * @throws {Error} - Throws an error if there was a problem writing the audit results to file.
 */
const writeCodeCouplingAuditToFile = ({
  codeCouplingOptions,
  codeCouplingAnalysisResult,
}) => {
  try {
    const {
      outputDir,
      fileFormat,
    } = codeCouplingOptions || {};

    AppLogger.info(`[CodeCouplingUtils - writeCodeCouplingAuditToFile] outputDir:  ${outputDir}`);
    AppLogger.info(`[CodeCouplingUtils - writeCodeCouplingAuditToFile] fileFormat:  ${fileFormat}`);

    if(!outputDir?.length){
      return false;
    }

    if(!codeCouplingAnalysisResult){
      return false;
    }

    const {
      reports,
      svg,
      circular,
    } = codeCouplingAnalysisResult;

    AppLogger.info(`[CodeCouplingUtils - writeCodeCouplingAuditToFile] reports:  ${reports?.length}`);
    AppLogger.info(`[CodeCouplingUtils - writeCodeCouplingAuditToFile] svg:  ${svg?.length}`);
    AppLogger.info(`[CodeCouplingUtils - writeCodeCouplingAuditToFile] circular:  ${circular?.length}`);

    if(!reports?.length){
      return false;
    }

    const codeCouplingAuditOutputFileName = `CodeCouplingReport.${fileFormat || 'json'}`;
    AppLogger.info(`[CodeCouplingUtils - writeCodeComplexityAuditToFile] codeCouplingAuditOutputFileName:  ${codeCouplingAuditOutputFileName}`);

    const codeCouplingAuditOutputFile = path.join(outputDir, codeCouplingAuditOutputFileName);
    AppLogger.info(`[CodeCouplingUtils - writeCodeComplexityAuditToFile] codeCouplingAuditOutputFile:  ${codeCouplingAuditOutputFile}`);

    const svgOutputFileName = 'CodeCouplingReport.svg';
    AppLogger.info(`[CodeCouplingUtils - writeCodeComplexityAuditToFile] svgOutputFileName:  ${svgOutputFileName}`);

    const svgOutputFile = path.join(outputDir, svgOutputFileName);
    AppLogger.info(`[CodeCouplingUtils - writeCodeComplexityAuditToFile] svgOutputFile:  ${svgOutputFile}`);

    if(fs.existsSync(codeCouplingAuditOutputFile)){
      fs.rmSync(codeCouplingAuditOutputFile);
    } else {
      fs.mkdirSync(outputDir, {
        recursive: true
      });
    }

    const formattedCouplingAuditReports = formatCodeCouplingAuditReports({
      reports,
      circularDependencies: circular,
      svgFile: svgOutputFileName,
      fileFormat,
    });

    if(!formattedCouplingAuditReports?.length){
      return false;
    }

    fs.writeFileSync(codeCouplingAuditOutputFile, formattedCouplingAuditReports);

    if(svg){
      if(fs.existsSync(svgOutputFile)){
        fs.rmSync(svgOutputFile);
      }

      fs.writeFileSync(svgOutputFile, svg);
    }

    return true;
  } catch (error) {
    AppLogger.info(`[CodeCouplingUtils - writeCodeCouplingAuditToFile] error:  ${error.message}`);
    return false;
  }
};

const CodeCouplingUtils = {
  writeCodeCouplingAuditToFile,
};

export default CodeCouplingUtils;