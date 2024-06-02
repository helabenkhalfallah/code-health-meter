import { execSync } from 'child_process';
import fs from 'fs-extra';
import AppLogger from '../../commons/AppLogger.js';

const defaultOptions = {
  'mode': 'strict',
  'threshold': 0,
  'format': [
    'javascript',
    'typescript',
    'jsx',
    'tsx'
  ],
  'ignore': [
    '**/node_modules/**',
    '**/target/**',
    '**/dist/**',
    '**/__mocks__/*',
    '**/husky/**',
    '**/.vscode/.*',
    '**/.idea/**',
    '**/.gitlab/**',
    '**/.github/**',
    'eslint.*',
    'jest.*',
    'test',
    'next.*',
    'babel.*',
    '.*.d.ts.*'
  ]
};

/**
 * This asynchronous function starts the audit process.
 * @param {string} directory - The directory to be audited.
 * @param {string} outputDir - The directory where the audit results will be stored.
 * @param {string} fileFormat - The format of the audit report file.
 * @returns {Promise<boolean>} A promise that resolves to `true` if the audit was successful, and `false` otherwise.
 * @throws Will throw an error if the audit process fails.
 */
const startAudit = async (directory, outputDir, fileFormat) => {
  try {

    AppLogger.info(`[CodeDuplicationAuditor - inspectDirectory] directory:  ${directory}`);
    AppLogger.info(`[CodeDuplicationAuditor - inspectDirectory] outputDir:  ${outputDir}`);
    AppLogger.info(`[CodeDuplicationAuditor - inspectDirectory] fileFormat:  ${fileFormat}`);

    const codeDuplicationCommand = `jscpd --silent --mode "${defaultOptions.mode}" --threshold ${defaultOptions.threshold} --reporters "${fileFormat}" --output "${outputDir}" --format "${defaultOptions.format}" --ignore "${defaultOptions.ignore.join(',')}" ${directory}`;
    AppLogger.info(`[CodeDuplicationAuditor - inspectDirectory] jscpd script:  ${codeDuplicationCommand}`);

    // generate report
    execSync(codeDuplicationCommand);

    // rename html folder
    const temporaryHtmlReportPath = `${outputDir}/html`;
    const finalHtmlReportPath = `${outputDir}/code-duplication`;
    const temporaryJsonReportFilePath = `${outputDir}/jscpd-report.json`;
    const finalJsonReportFilePath = `${outputDir}/CodeDuplicationReport.json`;

    if(fs.existsSync(temporaryHtmlReportPath)) {
      fs.renameSync(temporaryHtmlReportPath, finalHtmlReportPath);
    }

    // rename json folder
    if(fs.existsSync(temporaryJsonReportFilePath)) {
      fs.renameSync(temporaryJsonReportFilePath, finalJsonReportFilePath);
    }

    return true;
  } catch (error) {
    AppLogger.info(`[CodeDuplicationAuditor - inspectDirectory] error:  ${error.message}`);
    return false;
  }
};

const CodeDuplicationAuditor = {
  startAudit,
};

export default CodeDuplicationAuditor;