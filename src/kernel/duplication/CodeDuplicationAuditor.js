import { execSync } from 'child_process';
import fs from 'fs-extra';

import AppLogger from '../../commons/AppLogger.js';
import { codeDuplicationDefaultOptions, getFileContent } from '../../commons/AuditUtils.js';

/**
 * This asynchronous function starts the audit process.
 * @param {string} directory - The directory to be audited.
 * @param {string} outputDir - The directory where the audit results will be stored.
 * @param {string} fileFormat - The format of the audit report file.
 * @returns {Promise<boolean>} A promise that resolves to `true` if the audit was successful, and `false` otherwise.
 * @throws Will throw an error if the audit process fails.
 */
export const startDuplicationAudit = async (directory, outputDir, fileFormat) => {
    try {
        AppLogger.info(`[CodeDuplicationAuditor - startDuplicationAudit] directory:  ${directory}`);
        AppLogger.info(`[CodeDuplicationAuditor - startDuplicationAudit] outputDir:  ${outputDir}`);
        AppLogger.info(
            `[CodeDuplicationAuditor - startDuplicationAudit] fileFormat:  ${fileFormat}`,
        );

        // execute audit
        const codeDuplicationCommand = `pnpm jscpd --silent --mode "${codeDuplicationDefaultOptions.mode}" --threshold ${codeDuplicationDefaultOptions.threshold} --reporters "${fileFormat}" --output "${outputDir}" --format "${codeDuplicationDefaultOptions.format}" --ignore "${codeDuplicationDefaultOptions.ignore.join(',')}" ${directory}`;
        AppLogger.info(
            `[CodeDuplicationAuditor - startDuplicationAudit] jscpd script:  ${codeDuplicationCommand}`,
        );

        // generate report
        try {
            execSync(codeDuplicationCommand, { stdio: 'ignore' });
        } catch (error) {
            AppLogger.info(
                `[CodeDuplicationAuditor - startDuplicationAudit] execSync error:  ${error.message}`,
            );
        }

        // modify generated html
        if (fileFormat === 'html') {
            const outputHtmlPath = `${outputDir}/html/index.html`;
            const outputHtmlContent = await getFileContent(outputHtmlPath);
            if (outputHtmlContent?.length) {
                const newOutputHtmlDocument = outputHtmlContent
                    .replace(/<header.*header>/, '')
                    .replace(/<footer.*footer>/, '');
                fs.writeFileSync(outputHtmlPath, newOutputHtmlDocument);
            }
        }

        return true;
    } catch (error) {
        AppLogger.info(`[CodeDuplicationAuditor - startDuplicationAudit] error:  ${error.message}`);
        return false;
    }
};
