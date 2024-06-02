import AppLogger from '../../commons/AppLogger.js';
import CodeSecurityUtils from './CodeSecurityUtils.js';

const {
  inspectDirectory,
} = CodeSecurityUtils;

/**
 * Starts the audit process for a given directory and options.
 *
 * @async
 * @param {string} directory - The directory to audit.
 * @param {object} options - Audit options
 * @returns {Promise<*[]>} - Returns an array containing the results of the audit.
 * @throws {Error} - Throws an error if there was a problem starting the audit.
 */
const startAudit = async (directory, options) => {
  try {
    AppLogger.info(`[CodeSecurityAuditor - startAudit] directory:  ${directory}`);

    if(!directory?.length){
      return [];
    }

    const securityAuditReports = await inspectDirectory({
      srcDir: directory,
      options,
    });

    AppLogger.info(`[CodeSecurityAuditor - startAudit] securityAuditReports:  ${securityAuditReports?.length}`);

    return securityAuditReports;
  } catch (error) {
    AppLogger.info(`[CodeSecurityAuditor - startAudit] error:  ${error.message}`);
    return [];
  }
};

const CodeSecurityAuditor = {
  startAudit
};

export default CodeSecurityAuditor;