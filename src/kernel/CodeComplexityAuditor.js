 
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
 * Build audit stats
 * @param {object} reports
 * @returns {{moderateCyclomaticTotal: number, badMaintainabilityTotal: number, goodMaintainabilityTotal: number, moderateMaintainabilityTotal: number, moderateCyclomaticFiles: string, goodMaintainabilityFiles: string, veryBadCyclomaticFiles: string, veryBadCyclomaticTotal: number, goodCyclomaticFiles: string, badCyclomaticTotal: number, badCyclomaticFiles: string, goodCyclomaticTotal: number, badMaintainabilityFiles: string, moderateMaintainabilityFiles: string}|{}}
 */
const buildAuditStats = (reports) => {
  if(!reports){
    return ({});
  }

  const complexityReports = reports
      .filter(item => item.title === 'Cyclomatic Complexity')
      .map(report => {
        return({
          file: report?.file,
          cyclomatic: report?.score,
        });
      });

  const maintainabilityReports = reports
      .filter(item => item.title === 'Maintainability Index IM (%)')
      .map(report => {
        return({
          file: report?.file,
          maintainability: report?.scorePercent,
        });
      });

  /*
  - 85 and above: good maintainability.
  - 65–85: moderate maintainability.
  - < 65: difficult to maintain.
  */
  const badMaintainabilityFiles = maintainabilityReports.filter(report => {
    return Math.ceil(report.maintainability) < 65;
  });

  const moderateMaintainabilityFiles = maintainabilityReports.filter(report => {
    return (Math.ceil(report.maintainability) < 85 && Math.ceil(report.maintainability) >= 65);
  });

  const goodMaintainabilityFiles = maintainabilityReports.filter(report => {
    return Math.ceil(report.maintainability) >= 85;
  });

  const goodCyclomaticFiles = complexityReports.filter(report => {
    return (report.cyclomatic <= 10 && report.cyclomatic >= 1);
  });

  const moderateCyclomaticFiles = complexityReports.filter(report => {
    return (report.cyclomatic <= 20 && report.cyclomatic > 10);
  });

  const badCyclomaticFiles = complexityReports.filter(report => {
    return (report.cyclomatic <= 40 && report.cyclomatic > 20);
  });

  const veryBadCyclomaticFiles = complexityReports.filter(report => {
    return (report.cyclomatic > 40);
  });

  return({
    goodMaintainabilityTotal:goodMaintainabilityFiles.length,
    goodMaintainabilityFiles: goodMaintainabilityFiles.map(item => `${item.file} (${item.maintainability})`).join('\n'),
    moderateMaintainabilityTotal:moderateMaintainabilityFiles.length,
    moderateMaintainabilityFiles: moderateMaintainabilityFiles.map(item => `${item.file} (${item.maintainability})`).join('\n'),
    badMaintainabilityTotal:badMaintainabilityFiles.length,
    badMaintainabilityFiles: badMaintainabilityFiles.map(item => `${item.file} (${item.maintainability})`).join('\n'),
    goodCyclomaticTotal:goodCyclomaticFiles.length,
    goodCyclomaticFiles: goodCyclomaticFiles.map(item => `${item.file} (${item.cyclomatic})`).join('\n'),
    moderateCyclomaticTotal: moderateCyclomaticFiles.length,
    moderateCyclomaticFiles: moderateCyclomaticFiles.map(item => `${item.file} (${item.cyclomatic})`).join('\n'),
    badCyclomaticTotal: badCyclomaticFiles.length,
    badCyclomaticFiles: badCyclomaticFiles.map(item => `${item.file} (${item.cyclomatic})`).join('\n'),
    veryBadCyclomaticTotal: veryBadCyclomaticFiles.length,
    veryBadCyclomaticFiles: veryBadCyclomaticFiles.map(item => `${item.file} (${item.cyclomatic})`).join('\n'),
  });
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
      summary: {
        ...(summary || {}),
        ...(buildAuditStats(auditReports) || {}),
      },
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
