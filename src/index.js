#!/usr/bin/env node

import fs from 'fs-extra';
import { execSync } from 'child_process';
import { parseArgs } from 'node:util';
import AppLogger from './commons/AppLogger.js';
import CodeComplexityAuditor from './kernel/complexity/CodeComplexityAuditor.js';
import CodeCouplingAuditor from './kernel/coupling/CodeCouplingAuditor.js';
import CodeDuplicationAuditor from './kernel/duplication/CodeDuplicationAuditor.js';
import CodeComplexityUtils from './kernel/complexity/CodeComplexityUtils.js';
import CodeCouplingUtils from './kernel/coupling/CodeCouplingUtils.js';

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
const {
  srcDir,
  outputDir,
  format,
} = args?.values || {};

/**
 * Checks if the source directory and output directory are provided.
 */
if(!srcDir || !outputDir){
  AppLogger.info('srcDir is require and must be a string (npm run code-health-meter --srcDir "../../my-path" --outputDir "../../my-output-path" --format "json or html")');
  process.exit(-1);
}

/**
 * Cleaning workspace
 */
if(fs.existsSync(outputDir)) {
  try{
    execSync(`rm -rf ${outputDir}`);
  } catch(error){
    AppLogger.info(`Code auditor cleaning workspace error:  ${error.message}`);
    process.exit(-1);
  }
}

/**
 * Starts the code complexity audit.
 * @type {Object}
 */
const codeComplexityAnalysisResult = await CodeComplexityAuditor.startAudit(
  srcDir,
  {
    exclude: null,
    noempty: true,
    quiet: true,
    title: srcDir,
  }
);

/**
 * Writes the audit result to files.
 */
CodeComplexityUtils
  .writeCodeComplexityAuditToFile({
    codeComplexityOptions: {
      outputDir: `${outputDir}/code-complexity-audit`,
      fileFormat: format, // html or json
    },
    codeComplexityAnalysisResult,
  });

/**
 * Starts the code coupling audit.
 * https://github.com/pahen/madge?tab=readme-ov-file#configuration
 * @type {Object}
 */
const codeCouplingAnalysisResult = await CodeCouplingAuditor.startAudit(srcDir);

/**
 * Writes the audit result to files.
 */
CodeCouplingUtils
  .writeCodeCouplingAuditToFile({
    codeCouplingOptions: {
      outputDir: `${outputDir}/code-coupling-audit`,
      fileFormat: format, // html or json
    },
    codeCouplingAnalysisResult,
  });

/**
 * Starts the code duplication audit.
 * @type {Object}
 */
CodeDuplicationAuditor.startAudit(
  srcDir,
  `${outputDir}/code-duplication-audit`,
  format
);
