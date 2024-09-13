/**
 * Module providing utilities for code modularity audits.
 * @module CodeModularityUtils
 */

import AppLogger from '../../commons/AppLogger.js';
import path from 'path';
import fs from 'fs-extra';

/**
 * Formats the code modularity audit reports based on the specified file format.
 * @function formatCodeModularityAuditReports
 * @param {Object} options - Options for formatting.
 * @param {string} options.fileFormat - The desired output file format ('json' or 'html').
 * @param {Object} options.projectTree - The project tree data.
 * @param {Graph} options.projectGraph - The Graphology graph representing the project.
 * @param {Object} options.projectLouvainDetails - The detailed results of the Louvain community detection.
 * @returns {string} - The formatted report content.
 */
const formatCodeModularityAuditReports = ({
  fileFormat,
  projectTree,
  projectGraph,
  projectLouvainDetails,
  projectDensity,
  projectDegreeCentrality,
  projectInDegreeCentrality,
  projectOutDegreeCentrality,
}) => {
  if(fileFormat === 'json'){
    return JSON.stringify({
      projectTree,
      projectGraph,
      projectLouvainDetails,
      projectDensity,
      projectDegreeCentrality,
      projectInDegreeCentrality,
      projectOutDegreeCentrality,
    }, null, 2);
  }

  if(fileFormat === 'html'){
    return ''; // Placeholder for future HTML formatting implementation
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
 * @param {Object} options.codeModularityAnalysisResult.projectTree - The project tree data.
 * @param {Graph} options.codeModularityAnalysisResult.projectGraph - The Graphology graph.
 * @param {Object} options.codeModularityAnalysisResult.projectLouvainDetails - Louvain details.
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
      projectTree,
      projectGraph,
      projectLouvainDetails,
      projectDensity,
      projectDegreeCentrality,
      projectInDegreeCentrality,
      projectOutDegreeCentrality,
    } = codeModularityAnalysisResult;

    AppLogger.info('[CodeModularityUtils - startAudit] projectTree:', projectTree);
    AppLogger.info('[CodeModularityUtils - startAudit] projectGraph:', projectGraph);
    AppLogger.info('[CodeModularityUtils - startAudit] projectLouvainDetails:', projectLouvainDetails);
    AppLogger.info('[CodeModularityUtils - startAudit] projectDensity:', projectDensity);
    AppLogger.info('[CodeModularityUtils - startAudit] projectDegreeCentrality:', projectDegreeCentrality);
    AppLogger.info('[CodeModularityUtils - startAudit] projectInDegreeCentrality:', projectInDegreeCentrality);
    AppLogger.info('[CodeModularityUtils - startAudit] projectOutDegreeCentrality:', projectOutDegreeCentrality);

    if(!projectTree){
      return false;
    }

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
      projectTree,
      projectGraph,
      projectLouvainDetails,
      projectDensity,
      projectDegreeCentrality,
      projectInDegreeCentrality,
      projectOutDegreeCentrality,
    });

    if(!formattedModularityAuditReports?.length){
      return false;
    }

    fs.writeFileSync(codeModularityAuditOutputFile, formattedModularityAuditReports);

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