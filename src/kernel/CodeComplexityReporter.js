import escomplex from 'typhonjs-escomplex';
import lodash from 'lodash';

/**
 * Parser options for the escomplex module analyzer.
 * @type {Object}
 */
const parserOptions = {
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
  const report = escomplex.analyzeModule(source, options, parserOptions);

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
 * The CodeComplexityReporter object.
 * @typedef {Object} CodeComplexityReporter
 * @property {function} process - Processes the source code to generate a complexity report.
 */
const CodeComplexityReporter = {
  process,
};

export default CodeComplexityReporter;
