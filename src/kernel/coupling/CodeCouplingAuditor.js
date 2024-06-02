import Madge from 'madge';
import AppLogger from '../../commons/AppLogger.js';

const defaultOptions = {
  fileExtensions: [
    'ts',
    'tsx',
    'js',
    'jsx'
  ],
  excludeRegExp: [
    '.*node_modules/.*',
    '.*target/.*',
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
    '.*babel.*',
    '.*webpack.*',
    '.*.config.*',
    '.*.types.*',
    '.*.svg',
    '.*.d.ts.*',
  ]
};

/**
 * Starts the audit process for a given directory and options.
 *
 * @async
 * @param {string} directory - The directory to audit.
 * @returns {Object} - Returns an object containing the results of the audit.
 * @throws {Error} - Throws an error if there was a problem starting the audit.
 */
const startAudit = async (directory) => {
  try {
    const dependenciesParseResult = await Madge(directory, defaultOptions);
    if(!dependenciesParseResult) {
      return ({});
    }

    const dependenciesTree = dependenciesParseResult.obj();
    if(!dependenciesTree
        || !Object.keys(dependenciesTree)?.length) {
      return ({});
    }

    const dependenciesTreeSvg = await dependenciesParseResult.svg();

    const dependenciesCouplingReports = Object
      .keys(dependenciesTree)
      .map(file => ({
        file: file,
        dependencies: dependenciesTree[file],
      }));
    if(!dependenciesCouplingReports?.length) {
      return ({});
    }

    for(const dependenciesCouplingReport of dependenciesCouplingReports) {
      const {
        file,
        dependencies,
      } = dependenciesCouplingReport;
      AppLogger.info(`[CodeCouplingAuditor - startAudit] file:  ${file}`);

      // Efferent Coupling (Ce): This is the number of classes in other packages that the classes in the package depend upon.
      // It’s an indicator of the package’s dependence on externalities.
      // In other words, it measures the outgoing dependencies.
      const efferentCoupling = dependencies?.length || 0;
      AppLogger.info(`[CodeCouplingAuditor - startAudit] efferentCoupling:  ${efferentCoupling}`);
      dependenciesCouplingReport.efferentCoupling = efferentCoupling;

      // Afferent Coupling (Ca): This is the number of classes in other packages that depend upon classes within the package.
      // It’s an indicator of the package’s responsibility.
      // In other words, it measures the incoming dependencies.
      const afferentCoupling = dependenciesCouplingReports
        .filter(item => item.file !== file && item.dependencies?.includes(file))?.length || 0;
      AppLogger.info(`[CodeCouplingAuditor - startAudit] afferentCoupling:  ${afferentCoupling}`);
      dependenciesCouplingReport.afferentCoupling = afferentCoupling;

      // Afferent (CA) and Efferent (CE) coupling then Instability indicator:
      // Instability I = CE / (CE + CA)
      const instabilityIndex = ((efferentCoupling / (efferentCoupling + afferentCoupling)) || 0)?.toFixed(2);
      AppLogger.info(`[CodeCouplingAuditor - startAudit] instabilityIndex:  ${instabilityIndex}`);
      dependenciesCouplingReport.instabilityIndex = instabilityIndex;
    }

    return({
      tree: dependenciesTree,
      warnings: dependenciesParseResult.warnings(),
      circular: dependenciesParseResult.circular(),
      circularGraph: dependenciesParseResult.circularGraph(),
      orphans: dependenciesParseResult.orphans(),
      leaves: dependenciesParseResult.leaves(),
      svg: dependenciesTreeSvg,
      reports: dependenciesCouplingReports,
    });
  } catch (error) {
    AppLogger.info(`[CodeCouplingAuditor - startAudit] error:  ${error.message}`);
    return ({});
  }
};

const CodeCouplingAuditor = {
  startAudit
};

export default CodeCouplingAuditor;