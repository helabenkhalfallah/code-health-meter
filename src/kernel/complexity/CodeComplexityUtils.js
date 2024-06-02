import fs from 'fs-extra';
import path from 'path';
import lodash from 'lodash';
import TyphonEscomplex from 'typhonjs-escomplex';
import AppLogger from '../../commons/AppLogger.js';
import AuditUtils from '../../commons/AuditUtils.js';
import CodeComplexityConfig from './CodeComplexityConfig.js';

const {
  formatCodeComplexityHtmlReport,
} = CodeComplexityConfig;

const {
  getFiles,
} = AuditUtils;

/**
 * Parser options for the escomplex module analyzer.
 * @type {Object}
 */
const ComplexityParserOptions = {
  sourceType: 'module',
  plugins: [
    'jsx',
    'objectRestSpread',
    'classProperties',
    'optionalCatchBinding',
    'asyncGenerators',
    'decorators-legacy',
    'typescript',
    'dynamicImport',
  ],
};

/**
 * Processes the source code to generate a complexity report.
 * @param {string} source - The source code to analyze.
 * @param {Object} options - The options for the escomplex module analyzer.
 * @param {Object} reportInfo - Information about the report.
 * @returns {Object} - Returns a report of the analyzed module.
 */
function process(source, options, reportInfo) {
  AppLogger.info(`[CodeComplexityUtils - process] options:  ${options}`);
  AppLogger.info(`[CodeComplexityUtils - process] reportInfo:  ${reportInfo}`);

  // https://github.com/escomplex/escomplex
  // https://github.com/escomplex/escomplex/blob/master/METRICS.md
  // https://github.com/typhonjs-node-escomplex/typhonjs-escomplex/blob/master/src/ESComplex.js#L3
  // https://github.com/typhonjs-node-ast/babel-parser/blob/master/src/BabelParser.js
  // https://github.com/typhonjs-node-ast/babel-parser/blob/master/src/BabelParser.js#L1C38-L1C38
  // https://github.com/typhonjs-node-ast/babel-parser/blob/master/src/BabelParser.js#L81
  // https://babeljs.io/docs/babel-parser#babelparserparsecode-options
  // https://babeljs.io/docs/babel-parser#output
  // http://www.literateprogramming.com/mccabe.pdf
  // http://horst-zuse.homepage.t-online.de/z-halstead-final-05-1.pdf
  // https://avandeursen.com/2014/08/29/think-twice-before-using-the-maintainability-index/
  const report = TyphonEscomplex.analyzeModule(source, options, ComplexityParserOptions);
  AppLogger.info(`[CodeComplexityUtils - process] report:  ${report}`);

  // Make the short filename easily accessible
  report.module = reportInfo.fileShort;

  // Munge the new `escomplex-js` format to match the older format of
  // `complexity-report`
  report.aggregate = report.aggregate || {};
  report.aggregate.complexity = lodash.clone(report.methodAggregate);

  function methodToReportFunction(func) {
    func.complexity = lodash.extend({}, {
      cyclomatic: func.cyclomatic,
      sloc: func.sloc,
      halstead: func.halstead,
    });

    func.line = func.line || func.lineStart;

    return func;
  }

  function allClassMethods(report) {
    if (!report.classes.length) {
      return [];
    }

    return lodash
      .chain(report.classes)
      .map((_class) => _class.methods)
      .flatten()
      .value();
  }

  const functions = report.methods.concat(allClassMethods(report));

  report.functions = lodash
    .chain(functions)
    .map(methodToReportFunction)
    .value();

  return report;
}

/**
 * An object containing the complexity analyzer.
 * @type {Object}
 */
const analyzers = {
  complexity: {
    process,
  },
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
 * Filters out information unused in the overview for space/performance.
 * @param {Array} reports - The reports to filter.
 * @returns {Object} - Returns an object containing the summary and files.
 */
const getOverviewReport = (reports) => {
  AppLogger.info(`[CodeComplexityUtils - getOverviewReport] reports:  ${reports?.length}`);

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
    summary.total.psloc += report.complexity.aggregate.sloc.physical;
    summary.total.lsloc += report.complexity.aggregate.sloc.logical;
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

  summary.average.psloc = Math.round(summary.total.psloc / reports.length);
  summary.average.lsloc = Math.round(summary.total.lsloc / reports.length);
  summary.average.maintainability = (
    summary.total.maintainability / reports.length
  ).toFixed(2);

  AppLogger.info(`[CodeComplexityUtils - getOverviewReport] moduleFiles:  ${moduleFiles?.length}`);

  return {
    summary,
    files: moduleFiles,
  };
};

/**
 * Parses a file and returns relevant information.
 *
 * @param {string} file - The path to the file.
 * @param {string} commonBasePath - The common base path for all files.
 * @param {Object} options - The options for parsing.
 * @param {RegExp} [options.exclude] - A regular expression for files to exclude.
 * @param {boolean} [options.noempty] - Whether to skip empty lines.
 * @returns {Object|null} An object containing the file information, or null if the file is excluded or not a JavaScript/TypeScript file.
 */
const parseFile = (file, commonBasePath, options) => {
  AppLogger.info(`[CodeComplexityUtils - parseFile] file:  ${file}`);
  AppLogger.info(`[CodeComplexityUtils - parseFile] commonBasePath:  ${commonBasePath}`);
  AppLogger.info(`[CodeComplexityUtils - parseFile] options:  ${options}`);

  const mockPattern = /.*?(Mock).(js|jsx|ts|tsx)$/ig;
  const testPattern = /.*?(Test).(js|jsx|ts|tsx)$/ig;
  const nodeModulesPattern = /node_modules/g;
  const targetModulesPattern = /target/g;

  if (file && (
    (options.exclude && file.match(options.exclude)) ||
      file.match(targetModulesPattern) ||
      file.match(mockPattern) ||
      file.match(testPattern) ||
      file.match(nodeModulesPattern)
  )) {
    AppLogger.info(`[CodeComplexityUtils - parseFile] excluded file:  ${file}`);
    return null;
  }

  if (!file.match(/\.(js|jsx|ts|tsx)$/)) {
    return null;
  }

  AppLogger.info(`[CodeComplexityUtils - parseFile] matched file:  ${file}`);

  const fileShort = file.replace(commonBasePath, '');
  const fileSafe = fileShort.replace(/[^a-zA-Z0-9]/g, '_');

  AppLogger.info(`[CodeComplexityUtils - parseFile] fileShort:  ${fileShort}`);
  AppLogger.info(`[CodeComplexityUtils - parseFile] fileSafe:  ${fileSafe}`);

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

  return ({
    file,
    fileSafe,
    fileShort,
    source,
    options,
  });
};

/**
 * Inspects a file and runs reports against it.
 *
 * @param {Object} params - The parameters for the function.
 * @param {string} params.file - The path to the file.
 * @param {string} params.commonBasePath - The common base path for all files.
 * @param {Object} params.options - The options for parsing and reporting.
 * @returns {Object|null} An object containing the reports for each analyzer, or null if an error occurs.
 */
const inspectFile = ({
  file,
  commonBasePath,
  options
}) => {
  try {
    const report = parseFile(file, commonBasePath, options);
    if(!report){
      return null;
    }

    const {
      fileSafe,
      fileShort,
      source,
    } = report;

    const reportInfo = {
      file,
      fileShort,
      fileSafe,
    };

    // run reports against current file
    return Object
      .keys(analyzers)
      .reduce((acc, analyzerName) => {
        // if we should not execute parser
        if (!options[analyzerName]) {
          return acc;
        }
        try {
          const reporter = analyzers[analyzerName];
          acc[analyzerName] = reporter?.process(source, options[analyzerName], reportInfo);
          return acc;
        } catch (error) {
          console.log(`[parseFile]: file ${file} process error:  ${error}`, options);
          return acc;
        }
      }, {});
  } catch (error) {
    AppLogger.info(`[CodeComplexityUtils - inspectFile] error:  ${error.message}`);
    return null;
  }
};

/**
 * Finds the common base path among a list of files.
 * @param {string[]} files - The list of file paths.
 * @returns {string} - Returns the common base path.
 */
function findCommonBase(files) {
  AppLogger.info(`[CodeComplexityUtils - findCommonBase] files:  ${files?.length}`);

  if (!files
      || files.length === 0
      || files.length === 1) {
    return '';
  }

  const lastSlash = files[0].lastIndexOf(path.sep);
  AppLogger.info(`[CodeComplexityUtils - findCommonBase] lastSlash:  ${lastSlash}`);

  if (!lastSlash) {
    return '';
  }

  const first = files[0].substr(0, lastSlash + 1);
  AppLogger.info(`[CodeComplexityUtils - findCommonBase] first:  ${first}`);

  let prefixlen = first.length;
  AppLogger.info(`[CodeComplexityUtils - findCommonBase] prefixlen:  ${prefixlen}`);

  /**
   * Handles the prefixing of a file.
   * @param {string} file - The file to handle.
   */
  function handleFilePrefixing(file) {

    AppLogger.info(`[CodeComplexityUtils - findCommonBase] file:  ${file}`);

    for (let i = prefixlen; i > 0; i--) {
      if (file.substr(0, i) === first.substr(0, i)) {
        prefixlen = i;
        return;
      }
    }
    prefixlen = 0;
  }

  files.forEach(handleFilePrefixing);

  AppLogger.info(`[CodeComplexityUtils - findCommonBase] prefixlen:  ${prefixlen}`);

  return first.substr(0, prefixlen);
}

/**
 * Inspect directory files.
 * @param {string} srcDir - The directory to parse.
 * @param {Object} options - The options for the parser.
 * @returns {Array} - Returns an array containing the reports.
 */
const inspectFiles = (srcDir, options) => {
  try {
    const files = getFiles(srcDir);
    AppLogger.info(`[CodeComplexityUtils - inspectFiles] files:  ${files?.length}`);

    if(!files?.length){
      return [];
    }

    const mergedOptions = {
      ...(options || {}),
      ...complexityReportOptions,
    };

    const commonBasePath = findCommonBase(files);

    AppLogger.info(`[CodeComplexityUtils - inspectFiles] commonBasePath:  ${commonBasePath}`);

    const reports = [];

    for (let i = 0; i < files.length; i += 1) {
      const file = files[i];
      const report = inspectFile({
        file,
        commonBasePath,
        options: mergedOptions,
      });
      if (report &&
        Object.keys(report) &&
        Object.keys(report).length > 0) {
        reports.push(report);
      }
    }

    AppLogger.info(`[CodeComplexityUtils - inspectFiles] reports:  ${reports?.length}`);

    return reports;
  } catch (error) {
    AppLogger.info(`[CodeComplexityUtils - inspectFiles] error:  ${error.message}`);
    return null;
  }
};

/**
 * Inspects the source directory.
 * @param {Object} params - The parameters for the inspection.
 * @returns {Object} - Returns an object containing the overview report.
 */
const inspectDirectory = ({
  srcDir,
  options,
}) => {
  try {
    AppLogger.info(`[CodeComplexityUtils - inspectDirectory] srcDir:  ${srcDir}`);

    const reports = inspectFiles(srcDir, options);

    AppLogger.info(`[CodeComplexityUtils - inspectDirectory] reports:  ${reports?.length}`);

    return getOverviewReport(reports);
  } catch (error) {
    return null;
  }
};

/**
 * Groups reports by file.
 * @param {Array} reports - The reports to group.
 * @returns {Object} - Returns an object with the reports grouped by file.
 */
const groupReportsByFile = (reports) => reports?.reduce((acc, report) => ({
  ...acc,
  [report.file]: [
    ...(acc[report.file] || []),
    {
      title: report.title,
      score: `${Number((report.score || report.scorePercent || 0).toFixed(2))} ${report.scoreUnit || ''}`,
    },
  ],
}), {});

/**
 * Formats the audit reports.
 * @param {object} summary - The audit summary
 * @param {Array} auditReports - The audit reports to format.
 * @param {string} fileFormat - The format of the file.
 * @returns {string} - Returns a string with the formatted reports.
 */
const formatCodeComplexityAuditReports = ({
  summary,
  auditReports,
  fileFormat,
}) => {
  const reportsByFile = groupReportsByFile(auditReports);

  if(fileFormat === 'json'){
    return JSON.stringify({
      summary,
      reports: reportsByFile,
    }, null, 2);
  }

  if(fileFormat === 'html'){
    const helpMessages = [
      ...new Set(auditReports.map((report) => report.description) || [])
    ].map((description, index) => `${index + 1}) ${description}`) || [];
    return formatCodeComplexityHtmlReport(summary, helpMessages, reportsByFile);
  }

  return '';
};

/**
 * Writes the result of a code complexity analysis to a file.
 *
 * @param {Object} codeComplexityOptions - The options for the code complexity analysis.
 * @param {string} codeComplexityOptions.outputDir - The output directory to write the report to.
 * @param {string} codeComplexityOptions.fileFormat - The format of the file to write the report to.
 * @param {Function} codeComplexityOptions.reportsFormatter - The formatter function for the HTML report.
 * @param {Object} codeComplexityAnalysisResult - The result of the code complexity analysis.
 * @param {Object} codeComplexityAnalysisResult.summary - The summary of the code complexity analysis.
 * @param {Object[]} codeComplexityAnalysisResult.auditReports - The audit reports from the code complexity analysis.
 * @returns {boolean} Returns true if the file was written successfully, false otherwise.
 * @throws {Error} If an error occurs while writing the file.
 */
const writeCodeComplexityAuditToFile = ({
  codeComplexityOptions,
  codeComplexityAnalysisResult,
}) => {
  try{
    const {
      outputDir,
      fileFormat,
    } = codeComplexityOptions || {};

    AppLogger.info(`[CodeComplexityUtils - writeCodeComplexityAuditToFile] outputDir:  ${outputDir}`);
    AppLogger.info(`[CodeComplexityUtils - writeCodeComplexityAuditToFile] fileFormat:  ${fileFormat}`);

    if(!outputDir?.length){
      return false;
    }

    const {
      summary,
      auditReports,
    } = codeComplexityAnalysisResult || {};

    const codeComplexityAuditOutputFileName = `CodeComplexityReport.${fileFormat || 'json'}`;
    AppLogger.info(`[CodeComplexityUtils - writeCodeComplexityAuditToFile] codeComplexityAuditOutputFileName:  ${codeComplexityAuditOutputFileName}`);

    const codeComplexityAuditOutputFile = path.join(outputDir, codeComplexityAuditOutputFileName);
    AppLogger.info(`[CodeComplexityUtils - writeCodeComplexityAuditToFile] codeComplexityAuditOutputFile:  ${codeComplexityAuditOutputFile}`);

    if(fs.existsSync(codeComplexityAuditOutputFile)){
      fs.rmSync(codeComplexityAuditOutputFile);
    } else {
      fs.mkdirSync(outputDir, {
        recursive: true
      });
    }

    const formattedCodeComplexityAuditReports = formatCodeComplexityAuditReports({
      summary,
      auditReports,
      fileFormat,
    });

    if(!formattedCodeComplexityAuditReports?.length){
      return false;
    }

    fs.writeFileSync(codeComplexityAuditOutputFile, formattedCodeComplexityAuditReports);

    return true;
  } catch (error) {
    AppLogger.info(`[CodeComplexityUtils - writeCodeComplexityAuditToFile] error:  ${error.message}`);
    return false;
  }
};

/**
 * The CodeComplexityUtils object.
 * @typedef {Object} CodeComplexityUtils
 * @property {function} inspectDirectory - Inspects the source directory.
 */
const CodeComplexityUtils = {
  inspectDirectory,
  writeCodeComplexityAuditToFile,
};

export default CodeComplexityUtils;
