#!/usr/bin/env node

import { parseArgs } from 'node:util';
import AppLogger from './commons/AppLogger.js';
import CodeComplexityAuditor from './kernel/complexity/CodeComplexityAuditor.js';
import CodeCouplingAuditor from './kernel/coupling/CodeCouplingAuditor.js';
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
 * Starts the code coupling audit.
 * https://github.com/pahen/madge?tab=readme-ov-file#configuration
 * @type {Object}
 */
const codeCouplingAnalysisResult = await CodeCouplingAuditor.startAudit(srcDir, {
  'fileExtensions': [
    'ts',
    'tsx',
    'js',
    'jsx'
  ],
  excludeRegExp: [
    '.*node_modules/.*',
    '.*dist/.*',
    '.*__mocks__/.*',
    '.*husky/.*',
    '.*husky/.*',
    '.*vscode/.*',
    '.*idea/.*',
    '.*gitlab/.*',
    '.*github/.*',
    '.*eslint.*',
    '.*jest.*',
    '.*test.*',
    '.*next.config.*',
    '.*.d.ts.*',
  ]
});

/**
 * Writes the audit result to files.
 */
CodeComplexityUtils
  .writeCodeComplexityAuditToFile({
    codeComplexityOptions: {
      outputDir,
      fileFormat: format, // html or json
    },
    codeComplexityAnalysisResult,
  });

CodeCouplingUtils
  .writeCodeCouplingAuditToFile({
    codeCouplingOptions: {
      outputDir,
      fileFormat: format, // html or json
    },
    codeCouplingAnalysisResult,
  });


