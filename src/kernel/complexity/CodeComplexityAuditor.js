import AppLogger from '../../commons/AppLogger.js';
import { isAcceptedFileType, isExcludedFile } from '../../commons/AuditUtils.js';
import { buildAuditStats, buildFullComplexityReport } from './CodeComplexityBuilder.js';
import { inspectDirectory } from './CodeComplexityUtils.js';

/** @typedef {import('./CodeComplexityMetrics.js').AnalyzedFileEntry} AnalyzedFileEntry */
/** @typedef {import('./CodeComplexityMetrics.js').MetricId} MetricId */

/**
 * Start Code Complexity Audit (full report), using per-metric builders internally.
 * Returns `{}` on failure to preserve prior API behavior.
 *
 * @async
 * @param {string} directory - Root directory to analyze.
 * @param {Object} options   - Options (forwarded to `inspectDirectory` if needed).
 * @returns {Promise<{summary:Object, auditReports:Object[]} | {}>}
 */
export const startComplexityAudit = async (directory, options) => {
    try {
        AppLogger.info(`[CodeComplexityAuditor - startAudit] directory:  ${directory}`);
        if (!directory?.length) return {};

        const inspectOpts = options?.inspect ?? options;

        const { summary, files } = inspectDirectory({
            srcDir: directory,
            options: inspectOpts,
        });

        AppLogger.info(`[CodeComplexityAuditor - startAudit] files:  ${files?.length}`);
        AppLogger.info(
            `[CodeComplexityAuditor - startAudit] summary keys:  ${Object.keys(summary || {})?.length}`,
        );

        if (!files?.length) return {};

        /** @type {AnalyzedFileEntry[]} */
        const auditableEntries = files
            .filter((item) => {
                const fileName = item.file;
                return isAcceptedFileType(fileName) && !isExcludedFile(fileName);
            })
            .sort((a, b) => (a.fileMaintainability > b.fileMaintainability ? 1 : -1));

        /** @type {MetricId[]} */
        const metricIds = options?.metrics?.ids ?? ['mi', 'sloc', 'cyclo', 'hal'];

        const { summary: combinedSummary, auditReports } = buildFullComplexityReport({
            entries: auditableEntries,
            metricIds,
            summaryBase: summary,
            buildAuditStats,
        });

        return { summary: combinedSummary, auditReports };
    } catch (error) {
        AppLogger.info(`[CodeComplexityAuditor - startAudit] error:  ${error.message}`);
        return {};
    }
};
