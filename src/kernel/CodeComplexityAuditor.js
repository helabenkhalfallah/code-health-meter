 
import CodeComplexityConfig from '../config/CodeComplexityConfig.js';
import CodeAnalysisUtils from './CodeAnalysisUtils.js';
import AuditUtils from '../commons/AuditUtils.js';
import AppLogger from '../commons/AppLogger.js';

const {
  formatHalsteadReports,
  formatMaintainabilityIndexReport,
  formatCyclomaticComplexityReport,
} = CodeComplexityConfig;

const {
  isAcceptedFileType,
  isExcludedFile,
} = AuditUtils;

const {
  inspect,
} = CodeAnalysisUtils;

/**
 * Build files complexity reports
 * @param {Array} files
 * @return {null|*[]}
 */
const buildFilesComplexityReports = (files) => {
  try {
    const auditReports = [];

    for (const item of files) {
      const {
        file,
        fileMaintainability,
        fileComplexity,
      } = item || {};

      AppLogger.info(`[CodeComplexityAuditor - buildFilesComplexityReports] file:  ${file}`);

      if (!file?.length) {
        continue;
      }

      const {
        cyclomatic,
        halstead,
      } = fileComplexity || {};

      auditReports.push(formatMaintainabilityIndexReport(fileMaintainability, file));

      auditReports.push(formatCyclomaticComplexityReport(cyclomatic, file));

      auditReports.push(...formatHalsteadReports(halstead, file));
    }

    return auditReports;
  } catch (error) {
    AppLogger.info(`[buildModuleComplexityReport] reading main folder error:  ${error.message}`);
    return null;
  }
};

/**
 * Start Code Complexity Audit
 * @param {string} directory
 * @param {object} options
 * @returns {Promise<{summary: {average: {sloc: number, maintainability: number}, total: {sloc: number, maintainability: number}}, auditReports: *[]}|{}>}
 */
const startAudit = async (directory, options) => {
  try {
    AppLogger.info(`[CodeComplexityAuditor - startAudit] directory:  ${directory}`);

    if(!directory?.length){
      return ({});
    }

    const {
      summary,
      files,
    } = inspect(
        {
          srcDir: directory,
          options,
        }
    );

    AppLogger.info(`[CodeComplexityAuditor - startAudit] files:  ${files?.length}`);
    AppLogger.info(`[CodeComplexityAuditor - startAudit] summary:  ${Object.keys(summary || {})?.length}`);

    if (!files?.length) {
      return ({});
    }

    const auditReports = [];

    const auditableFiles = files
        .filter((item) => {
          const fileName = item.file;
          return (
              isAcceptedFileType(fileName) &&
              !isExcludedFile(fileName) &&
              !fileName?.toLowerCase()?.includes('/types/') &&
              !fileName?.toLowerCase()?.includes('type') &&
              !fileName?.toLowerCase()?.includes('index') &&
              !fileName?.toLowerCase()?.includes('dico')
          );
        })
        .sort((a, b) => a.fileMaintainability > b.fileMaintainability ? 1 : -1);

    const filesComplexityReports = buildFilesComplexityReports(auditableFiles);

    auditReports.push(...(filesComplexityReports || []));

    return ({
      summary,
      auditReports,
    });
  } catch (error) {
    AppLogger.info(`[CodeComplexityAuditor - startAudit] error:  ${error.message}`);
    return ({});
  }
};

const CodeComplexityAuditor = {
  startAudit,
};

export default CodeComplexityAuditor;
