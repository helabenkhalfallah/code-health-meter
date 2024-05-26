import CodeComplexityAuditor from './kernel/CodeComplexityAuditor.js';
import AppLogger from './commons/AppLogger.js';
import AuditUtils from './commons/AuditUtils.js';

const{
  writeAuditToFile
} = AuditUtils;

const directory  = '../my-directory';

const options = {
    exclude: null,
    noempty: true,
    quiet: true,
    title: directory,
};

const codeComplexityReports = await CodeComplexityAuditor.startAudit(directory, options);

AppLogger.info(`[AuditorWorker] codeComplexityReports:  ${codeComplexityReports?.length}`);

writeAuditToFile(codeComplexityReports, {
    fileName: 'MyAwesomeReport',
    fileFormat: 'html' // html or json
});