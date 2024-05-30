#!/usr/bin/env node

import path from 'path';
import { parseArgs } from 'node:util';
import CodeComplexityAuditor from './kernel/complexity/CodeComplexityAuditor.js';
import CodeComplexityConfig from './kernel/complexity/CodeComplexityConfig.js';
import AppLogger from './commons/AppLogger.js';
import AuditUtils from './commons/AuditUtils.js';

const{
  writeAuditToFile
} = AuditUtils;

const {
  formatHtmlComplexityReports
} = CodeComplexityConfig;

const args = parseArgs({
  options: {
    srcDir: {
      type: 'string',
    },
    outputDir: {
      type: 'string',
    },
    outputFile: {
      type: 'string',
    },
    format: {
      type: 'string',
    },
  },
});

const {
  srcDir,
  outputDir,
  outputFile,
  format,
} = args?.values || {};

if(!srcDir){
  AppLogger.info('srcDir is require and must be a string (npm run code-health-meter --srcDir "../../my-path" --outputDir "../../my-output-path" --outputFile "OutputFileName" --format "json or html")');
  process.exit(-1);
}

const directory  = srcDir;

const inputOptions = {
  exclude: null,
  noempty: true,
  quiet: true,
  title: directory,
};

const outPutOptions = {
  fileName: path.join(outputDir, outputFile),
  fileFormat: format, // html or json
  htmlReportFormatter: formatHtmlComplexityReports,
};

const {
  summary,
  auditReports,
} = await CodeComplexityAuditor.startAudit(directory, inputOptions);

AppLogger.info(`[AuditorWorker] summary:  ${Object.keys(summary || {}).length}`);
AppLogger.info(`[AuditorWorker] auditReports:  ${auditReports?.length}`);

writeAuditToFile(summary, auditReports, outPutOptions);
