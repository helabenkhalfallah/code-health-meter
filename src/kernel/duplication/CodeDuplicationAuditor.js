import fs from 'fs-extra';
import { execSync } from 'child_process';
import AppLogger from '../../commons/AppLogger.js';
import AuditUtils from '../../commons/AuditUtils.js';

const {
  getFileContent,
} = AuditUtils;

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
    '**/mocks/*',
    '**/.husky/**',
    '**/.vscode/.*',
    '**/.idea/**',
    '**/.gitlab/**',
    '**/.github/**',
    '**/eslint-config/**',
    '**/jest-config/**',
    '**/tailwind-config/**',
    '**/typescript-config/**',
    '**/.eslintrc.**',
    '**/.gitlab-ci.**',
    '**/tailwind.**',
    '**/tsconfig.json',
    '**/turbo.json',
    '**/jest.**',
    '**/__test__/**',
    '**/**test.**',
    '**/**.config.**',
    '**/webpack/**',
    '**/**webpack**',
    '**/next**.**',
    '**/.next/**',
    'babel',
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

    AppLogger.info(`[CodeDuplicationAuditor - startAudit] directory:  ${directory}`);
    AppLogger.info(`[CodeDuplicationAuditor - startAudit] outputDir:  ${outputDir}`);
    AppLogger.info(`[CodeDuplicationAuditor - startAudit] fileFormat:  ${fileFormat}`);

    // add jscpd if not installed
    execSync('npm i -g jscpd@4.0.4', { stdio: 'ignore' });

    // execute audit
    const codeDuplicationCommand = `jscpd --silent --mode "${defaultOptions.mode}" --threshold ${defaultOptions.threshold} --reporters "${fileFormat}" --output "${outputDir}" --format "${defaultOptions.format}" --ignore "${defaultOptions.ignore.join(',')}" ${directory}`;
    AppLogger.info(`[CodeDuplicationAuditor - startAudit] jscpd script:  ${codeDuplicationCommand}`);

    // generate report
    try{
      execSync(codeDuplicationCommand, { stdio: 'ignore' });
    }catch (error){
      AppLogger.info(`[CodeDuplicationAuditor - startAudit] execSync error:  ${error.message}`);
    }

    // modify generated html
    if(fileFormat === 'html'){
      const outputHtmlPath = `${outputDir}/html/index.html`;
      const outputHtmlContent = await getFileContent(outputHtmlPath);
      if(outputHtmlContent?.length){
        const newOutputHtmlDocument = outputHtmlContent
          .replace(/<header.*header>/, '')
          .replace(/<footer.*footer>/, '');
        fs.writeFileSync(outputHtmlPath, newOutputHtmlDocument);
      }
    }

    return true;
  } catch (error) {
    AppLogger.info(`[CodeDuplicationAuditor - startAudit] error:  ${error.message}`);
    return false;
  }
};

const CodeDuplicationAuditor = {
  startAudit,
};

export default CodeDuplicationAuditor;
