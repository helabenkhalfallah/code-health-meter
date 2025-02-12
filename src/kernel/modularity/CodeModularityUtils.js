/**
 * Module providing utilities for code modularity audits.
 * @module CodeModularityUtils
 */

import path from 'path';
import fs from 'fs-extra';
import AppLogger from '../../commons/AppLogger.js';
import CodeModularityConfig from './CodeModularityConfig.js';

/**
 * Formats the code modularity audit reports based on the specified file format.
 * @function formatCodeModularityAuditReports
 * @param {Object} options - Options for formatting.
 * @param {string} options.fileFormat - The desired output file format ('json' or 'html').
 * @param {Object} options.reports - The detailed results of the Modularity Analysis.
 * @returns {string} - The formatted report content.
 */
const formatCodeModularityAuditReports = ({
  fileFormat,
  reports
}) => {
  if(!reports){
    return '';
  }

  if(fileFormat === 'json'){
    return JSON.stringify(reports, null, 2);
  }

  if(fileFormat === 'html'){
    return CodeModularityConfig.formatCodeModularityHtmlReports(reports);
  }

  return ''; // Default to empty string if format is not recognized
};

/**
 * Writes the code modularity audit results to a file.
 * @function writeCodeModularityAuditToFile
 * @param {Object} options - Options for writing the audit results.
 * @param {Object} options.codeModularityOptions - Code modularity audit options.
 * @param {string} options.codeModularityOptions.outputDir - The output directory for the report.
 * @param {string} options.codeModularityOptions.fileFormat - The desired output file format.
 * @param {Object} options.codeModularityAnalysisResult - The results of the code modularity analysis.
 * @param {Object} options.codeModularityAnalysisResult.louvainDetails - Louvain details.
 * @returns {boolean} - `true` if the write operation was successful, `false` otherwise.
 */
const writeCodeModularityAuditToFile = ({
  codeModularityOptions,
  codeModularityAnalysisResult,
}) => {
  try {
    const {
      outputDir,
      fileFormat,
    } = codeModularityOptions || {};

    AppLogger.info(`[CodeModularityUtils - writeCodeModularityAuditToFile] outputDir:  ${outputDir}`);
    AppLogger.info(`[CodeModularityUtils - writeCodeModularityAuditToFile] fileFormat:  ${fileFormat}`);

    if(!outputDir?.length){
      return false;
    }

    if(!codeModularityAnalysisResult){
      return false;
    }

    const {
      louvainDetails,
      density,
      degreeCentrality,
      inDegreeCentrality,
      outDegreeCentrality,
      svg,
    } = codeModularityAnalysisResult;

    AppLogger.info('[CodeModularityUtils - startAudit] louvainDetails:', louvainDetails);
    AppLogger.info('[CodeModularityUtils - startAudit] density:', density);
    AppLogger.info('[CodeModularityUtils - startAudit] degreeCentrality:', degreeCentrality);
    AppLogger.info('[CodeModularityUtils - startAudit] inDegreeCentrality:', inDegreeCentrality);
    AppLogger.info('[CodeModularityUtils - startAudit] outDegreeCentrality:', outDegreeCentrality);

    const codeModularityAuditOutputFileName = `CodeModularityReport.${fileFormat || 'json'}`;
    AppLogger.info(`[CodeModularityUtils - writeCodeComplexityAuditToFile] codeModularityAuditOutputFileName:  ${codeModularityAuditOutputFileName}`);

    const codeModularityAuditOutputFile = path.join(outputDir, codeModularityAuditOutputFileName);
    AppLogger.info(`[CodeModularityUtils - writeCodeComplexityAuditToFile] codeModularityAuditOutputFile:  ${codeModularityAuditOutputFile}`);

    const svgOutputFileName = 'CodeModularityReport.svg';
    AppLogger.info(`[CodeModularityUtils - writeCodeComplexityAuditToFile] svgOutputFileName:  ${svgOutputFileName}`);

    const svgOutputFile = path.join(outputDir, svgOutputFileName);
    AppLogger.info(`[CodeModularityUtils - writeCodeComplexityAuditToFile] svgOutputFile:  ${svgOutputFile}`);

    if(fs.existsSync(codeModularityAuditOutputFile)){
      fs.rmSync(codeModularityAuditOutputFile);
    } else {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const formattedModularityAuditReports = formatCodeModularityAuditReports({
      fileFormat,
      reports: {
        modularity: louvainDetails?.modularity,
        communities: louvainDetails?.communities,
        density,
        degreeCentrality,
        inDegreeCentrality,
        outDegreeCentrality,
        svgFile: svgOutputFileName
      }
    });

    if(!formattedModularityAuditReports?.length){
      return false;
    }

    fs.writeFileSync(codeModularityAuditOutputFile, formattedModularityAuditReports);

    if(svg){
      if(fs.existsSync(svgOutputFile)){
        fs.rmSync(svgOutputFile);
      }
      fs.writeFileSync(svgOutputFile, svg);
    }

    return true;
  } catch (error) {
    AppLogger.info(`[CodeModularityUtils - writeCodeModularityAuditToFile] error:  ${error.message}`);
    return false;
  }
};

/**
 * The CodeModularityUtils object containing utility functions for code modularity audits.
 * @const {Object} CodeModularityUtils
 * @property {function} writeCodeModularityAuditToFile - Writes the audit results to a file.
 */
const CodeModularityUtils = {
  writeCodeModularityAuditToFile
};

export default CodeModularityUtils;