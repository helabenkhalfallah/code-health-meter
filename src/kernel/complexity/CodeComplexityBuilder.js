import AppLogger from '../../commons/AppLogger.js';
import { buildMetricById } from './CodeComplexityMetrics.js';

/** JSDoc type imports for editors/IDE (still plain JS). */
/** @typedef {import('./CodeComplexityMetrics.js').AnalyzedFileEntry} AnalyzedFileEntry */
/** @typedef {import('./CodeComplexityMetrics.js').MetricReport} MetricReport */
/** @typedef {import('./CodeComplexityMetrics.js').MetricId} MetricId */

/** Titles used by buildAuditStats to categorize reports. */
export const REPORT_TITLES = Object.freeze({
    cyclomatic: 'Cyclomatic Complexity',
    mi: 'Maintainability Index IM (%)',
});

/**
 * Compose reports for selected metric ids over the same analyzed entries array.
 * @param {AnalyzedFileEntry[]} entries - From `inspectDirectory()`
 * @param {MetricId[]} [metricIds=['mi','sloc','cyclo','hal']]
 * @returns {MetricReport[]} concatenated metric reports
 */
export function composeComplexityReports(entries, metricIds = ['mi', 'sloc', 'cyclo', 'hal']) {
    /** @type {MetricReport[]} */
    const reports = [];
    const ids =
        Array.isArray(metricIds) && metricIds.length ? metricIds : ['mi', 'sloc', 'cyclo', 'hal'];
    for (const id of ids) {
        const fn = buildMetricById(id);
        if (!fn) {
            AppLogger.info(`[composeComplexityReports] Unknown metric id: ${id}`);
            continue;
        }
        reports.push(...(fn(entries) || []));
    }
    return reports;
}

/**
 * Aggregate audit statistics from a mixed set of metric reports.
 * Recognized titles: REPORT_TITLES.cyclomatic, REPORT_TITLES.mi
 * @param {MetricReport[]} reports
 * @returns {Object} categorized counts and newline-joined file lists
 */
export const buildAuditStats = (reports) => {
    if (!reports) return {};

    const complexityReports = reports
        .filter((item) => item.title === REPORT_TITLES.cyclomatic)
        .map((report) => ({ file: report?.file, cyclomatic: report?.score }));

    const maintainabilityReports = reports
        .filter((item) => item.title === REPORT_TITLES.mi)
        .map((report) => ({ file: report?.file, maintainability: report?.scorePercent }));

    // Maintainability buckets
    const badMaintainabilityFiles = maintainabilityReports.filter(
        (r) => Math.ceil(r.maintainability) < 65,
    );
    const moderateMaintainabilityFiles = maintainabilityReports.filter((r) => {
        const v = Math.ceil(r.maintainability);
        return v < 85 && v >= 65;
    });
    const goodMaintainabilityFiles = maintainabilityReports.filter(
        (r) => Math.ceil(r.maintainability) >= 85,
    );

    // Cyclomatic buckets
    const goodCyclomaticFiles = complexityReports.filter(
        (r) => r.cyclomatic <= 10 && r.cyclomatic >= 1,
    );
    const moderateCyclomaticFiles = complexityReports.filter(
        (r) => r.cyclomatic <= 20 && r.cyclomatic > 10,
    );
    const badCyclomaticFiles = complexityReports.filter(
        (r) => r.cyclomatic <= 40 && r.cyclomatic > 20,
    );
    const veryBadCyclomaticFiles = complexityReports.filter((r) => r.cyclomatic > 40);

    return {
        goodMaintainabilityTotal: goodMaintainabilityFiles.length,
        goodMaintainabilityFiles: goodMaintainabilityFiles
            .map((i) => `${i.file} (${i.maintainability})`)
            .join('\n'),
        moderateMaintainabilityTotal: moderateMaintainabilityFiles.length,
        moderateMaintainabilityFiles: moderateMaintainabilityFiles
            .map((i) => `${i.file} (${i.maintainability})`)
            .join('\n'),
        badMaintainabilityTotal: badMaintainabilityFiles.length,
        badMaintainabilityFiles: badMaintainabilityFiles
            .map((i) => `${i.file} (${i.maintainability})`)
            .join('\n'),

        goodCyclomaticTotal: goodCyclomaticFiles.length,
        goodCyclomaticFiles: goodCyclomaticFiles
            .map((i) => `${i.file} (${i.cyclomatic})`)
            .join('\n'),
        moderateCyclomaticTotal: moderateCyclomaticFiles.length,
        moderateCyclomaticFiles: moderateCyclomaticFiles
            .map((i) => `${i.file} (${i.cyclomatic})`)
            .join('\n'),
        badCyclomaticTotal: badCyclomaticFiles.length,
        badCyclomaticFiles: badCyclomaticFiles.map((i) => `${i.file} (${i.cyclomatic})`).join('\n'),
        veryBadCyclomaticTotal: veryBadCyclomaticFiles.length,
        veryBadCyclomaticFiles: veryBadCyclomaticFiles
            .map((i) => `${i.file} (${i.cyclomatic})`)
            .join('\n'),
    };
};

/**
 * Build the combined (full) report using per-metric builders.
 * Backwards-compatible: accepts `params.entries` (preferred) or legacy `params.files`.
 *
 * @param {Object} params
 * @param {AnalyzedFileEntry[]} [params.entries] - Preferred analyzed entries.
 * @param {AnalyzedFileEntry[]} [params.files]   - Legacy alias for entries.
 * @param {MetricId[]} [params.metricIds=['mi','sloc','cyclo','hal']]
 * @param {Object} [params.summaryBase] - Existing summary fields (psloc/lsloc/MI averages, etc.)
 * @param {(reports: MetricReport[]) => Object} [params.buildAuditStats] - Derives counts/lists
 * @returns {{ summary: Object, auditReports: MetricReport[] }}
 */
export function buildFullComplexityReport({
    entries,
    files,
    metricIds,
    summaryBase = {},
    buildAuditStats,
}) {
    const analyzed = entries ?? files ?? [];
    const auditReports = composeComplexityReports(analyzed, metricIds);
    const stats = buildAuditStats ? buildAuditStats(auditReports) : {};
    return { summary: { ...summaryBase, ...stats }, auditReports };
}
