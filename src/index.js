#!/usr/bin/env node
import { execSync } from 'child_process';
import fs from 'fs-extra';
import { parseArgs } from 'node:util';

import AppLogger from './commons/AppLogger.js';
import { startComplexityAudit } from './kernel/complexity/CodeComplexityAuditor.js';
import { writeCodeComplexityAuditToFile } from './kernel/complexity/CodeComplexityUtils.js';
import { startDuplicationAudit } from './kernel/duplication/CodeDuplicationAuditor.js';
import { startModularityAudit } from './kernel/modularity/CodeModularityAuditor.js';
import { writeCodeModularityAuditToFile } from './kernel/modularity/CodeModularityUtils.js';

/**
 * Parses command line arguments.
 * @type {Object}
 */
const args = parseArgs({
    options: {
        srcDir: {
            type: 'string',
        },
        outputDir: {
            type: 'string',
        },
        format: {
            type: 'string',
        },
    },
});

/**
 * Destructures the values from the parsed arguments.
 * @type {Object}
 */
const { srcDir, outputDir, format } = args?.values || {};

/**
 * Checks if the source directory and output directory are provided.
 */
if (!srcDir || !outputDir) {
    AppLogger.info(
        'srcDir is require and must be a string (npm run code-health-meter --srcDir "../../my-path" --outputDir "../../my-output-path" --format "json or html")',
    );
    process.exit(-1);
}

AppLogger.info('***** Code audit start *****');

/**
 * Cleaning workspace
 */
if (fs.existsSync(outputDir)) {
    try {
        execSync(`rm -rf ${outputDir}`, { stdio: 'ignore' });
    } catch (error) {
        AppLogger.info(`Code auditor cleaning workspace error:  ${error.message}`);
        process.exit(-1);
    }
}

/**
 * Starts the code complexity audit.
 * @type {Object}
 */
const codeComplexityAnalysisResult = await startComplexityAudit(srcDir, {
    exclude: null,
    noempty: true,
    quiet: true,
    title: srcDir,
});

/**
 * Writes the audit result to files.
 */
writeCodeComplexityAuditToFile({
    codeComplexityOptions: {
        outputDir: `${outputDir}/code-complexity-audit`,
        fileFormat: format, // html or json
    },
    codeComplexityAnalysisResult,
});

/**
 * Starts the code duplication audit.
 * @type {Object}
 */
await startDuplicationAudit(srcDir, `${outputDir}/code-duplication-audit`, format);

/**
 * Starts the code modularity audit.
 * https://github.com/pahen/madge?tab=readme-ov-file#configuration
 * @type {Object}
 */
const codeModularityAnalysisResult = await startModularityAudit(srcDir);

/**
 * Writes the audit result to files.
 */
writeCodeModularityAuditToFile({
    codeModularityOptions: {
        outputDir: `${outputDir}/code-modularity-audit`,
        fileFormat: format, // html or json
    },
    codeModularityAnalysisResult,
});

AppLogger.info('***** Code audit finished successfully *****');
