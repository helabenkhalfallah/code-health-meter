import fs from 'fs-extra';
import lodash from 'lodash';
import glob from 'globby';
import unixify from 'unixify';
import {
  findCommonBase,
} from './CodeAnalysisHelper.js';
import CodeComplexityReporter from './CodeComplexityReporter.js';
import AppLogger from '../commons/AppLogger.js';

/**
 * An object containing the complexity analyzer.
 * @type {Object}
 */
const analyzers = {
  complexity: CodeComplexityReporter,
};

/**
 * An object containing the options for the complexity report.
 * @type {Object}
 */
const complexityReportOptions = {
  complexity: {
    loc: true,
    newmi: true,
    range: true,
  },
};

/**
 * Prints a log message to the console.
 * @param {any} args - The arguments to print.
 * @param {Object} options - The options for the log.
 */
const printLog = (args, options = {}) => {
  if (!options.quiet) {
    AppLogger.info(args);
  }
};

/**
 * Filters out information unused in the overview for space/performance.
 * @param {Array} reports - The reports to filter.
 * @returns {Object} - Returns an object containing the summary and files.
 */
const getOverviewReport = (reports) => {
  const moduleFiles = [];
  const summary = {
    total: {
      sloc: 0,
      maintainability: 0,
    },
    average: {
      sloc: 0,
      maintainability: 0,
    },
  };

  reports.forEach((report) => {
    // clone objects so we don't have to worry about side effects
    summary.total.sloc += report.complexity.aggregate.sloc.physical;
    summary.total.maintainability += report.complexity.maintainability;

    const aggregate = lodash.cloneDeep(report.complexity.aggregate);
    if (report.complexity) {
      moduleFiles.push({
        file: report.complexity.module,
        fileMaintainability: lodash.cloneDeep(report.complexity.maintainability),
        fileComplexity: aggregate,
      });
    }
  });

  summary.average.sloc = Math.round(summary.total.sloc / reports.length);
  summary.average.maintainability = (
      summary.total.maintainability / reports.length
  ).toFixed(2);

  return {
    summary,
    files: moduleFiles,
  };
};

/**
 * Parses a file.
 * @param {string} file - The file to parse.
 * @param {string} commonBasePath - The common base path.
 * @param {Object} options - The options for the parser.
 * @returns {Object} - Returns an object containing the analyzer result.
 */
const parseFile = (file, commonBasePath, options) => {
  const mockPattern = /.*?(Mock).(js|jsx|ts|tsx)$/ig;
  const testPattern = /.*?(Test).(js|jsx|ts|tsx)$/ig;

  if (file && (
      (options.exclude && file.match(options.exclude)) ||
      file.match(mockPattern) ||
      file.match(testPattern)
  )) {
    return null;
  }

  if (!file.match(/\.(js|jsx|ts|tsx)$/)) {
    return null;
  }

  const fileShort = file.replace(commonBasePath, '');
  const fileSafe = fileShort.replace(/[^a-zA-Z0-9]/g, '_');

  let source = fs.readFileSync(file).toString();
  const trimmedSource = source.trim();

  if (!trimmedSource) {
    return null;
  }

  // if skip empty line option
  if (options.noempty) {
    source = source.replace(/^\s*[\r\n]/gm, '');
  }

  // if begins with shebang
  if (source[0] === '#' && source[1] === '!') {
    source = `//${source}`;
  }

  const reportInfo = {
    file,
    fileShort,
    fileSafe,
  };

  // run reports against current file
  const analyzerResult = Object
      .keys(analyzers)
      .reduce((acc, analyzerName) => {
        // if we should not execute parser
        if (!options[analyzerName]) {
          return acc;
        }
        try {
          const reporter = analyzers[analyzerName];
          printLog(`[parseFile]: reporter ${reporter}`);
          acc[analyzerName] = reporter?.process(source, options[analyzerName], reportInfo);
          return acc;
        } catch (error) {
          printLog(`[parseFile]: file ${file} process error:  ${error}`, options);
          return acc;
        }
      }, {});

  printLog(analyzerResult, options);

  return analyzerResult;
};

/**
 * Parses multiple files.
 * @param {Array} files - The files to parse.
 * @param {Object} options - The options for the parser.
 * @returns {Array} - Returns an array containing the reports.
 */
const parseFiles = (files, options) => {
  const reports = [];

  const commonBasePath = findCommonBase(files);

  for (let i = 0; i < files.length; i += 1) {
    const file = files[i];
    const report = parseFile(file, commonBasePath, options);
    if (report &&
        Object.keys(report) &&
        Object.keys(report).length > 0) {
      reports.push(report);
    }
  }

  return reports;
};

/**
 * Converts a pattern to a file.
 * @param {string} pattern - The pattern to convert.
 * @returns {Array} - Returns an array containing the files.
 */
const patternToFile = (pattern) => glob.sync(unixify(pattern));


/**
 * Inspects the source directory.
 * @param {Object} params - The parameters for the inspection.
 * @returns {Object} - Returns an object containing the overview report.
 */
const inspect = ({
                   srcDir,
                   options,
                 }) => {
  try {
    printLog({
      srcDir,
      options,
    }, options);

    if (!srcDir || !srcDir.length) {
      return null;
    }

    const files = lodash
        .chain([
          srcDir,
        ])
        .map(patternToFile)
        .flatten()
        .value();

    printLog(files, options);

    if (!files.length) {
      return null;
    }

    const mergedOptions = {
      ...(options || {}),
      ...complexityReportOptions,
    };

    printLog(mergedOptions, options);

    const reports = parseFiles(files, mergedOptions);
    printLog(reports, options);

    const overviewReport = getOverviewReport(reports);
    printLog(overviewReport, options);

    return overviewReport;
  } catch (error) {
    return null;
  }
};

/**
 * The CodeAnalysisUtils object.
 * @typedef {Object} CodeAnalysisUtils
 * @property {function} inspect - Inspects the source directory.
 */
const CodeAnalysisUtils = {
  inspect,
};

export default CodeAnalysisUtils;
