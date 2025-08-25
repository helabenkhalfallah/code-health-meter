import AppLogger from '../../commons/AppLogger.js';
import { buildMetricById } from './CodeComplexityMetrics.js';

/**
 * String identifiers for per-file metrics available in the composer.
 * @typedef {'mi'|'sloc'|'cyclo'|'hal'} MetricId
 */

/**
 * A single analyzed file entry produced upstream (e.g., inspectDirectory()).
 * @typedef {Object} FileComplexityItem
 * @property {string} file
 * @property {number} fileMaintainability
 * @property {{ cyclomatic?: number, halstead?: Record<string, any> }} fileComplexity
 * @property {{ physical?: number, logical?: number }} fileSLOC
 */

/**
 * A single formatted metric report entry (as produced by CodeComplexityConfig formatters).
 * @typedef {Object} MetricReport
 * @property {string} title
 * @property {string} file
 * @property {number} [score]
 * @property {number} [scorePercent]
 * @property {string} [scoreUnit]
 */

/** Titles used by buildAuditStats to categorize reports. */
export const REPORT_TITLES = {
    cyclomatic: 'Cyclomatic Complexity',
    mi: 'Maintainability Index IM (%)',
};

/**
 * Compose reports for the selected metric ids in a single pass over the same `files` array.
 * Keeps things fast while each metric remains independently reusable.
 *
 * @param {FileComplexityItem[]} files - Precomputed file entries (no IO here).
 * @param {MetricId[]} [metricIds=['mi','sloc','cyclo','hal']] - Metrics to include.
 * @returns {MetricReport[]} Concatenated metric reports.
 *
 * @example
 * // Just MI + Cyclomatic
 * const reports = composeComplexityReports(files, ['mi','cyclo']);
 */
export function composeComplexityReports(files, metricIds = ['mi', 'sloc', 'cyclo', 'hal']) {
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
        reports.push(...(fn(files) || []));
    }
    return reports;
}

/**
 * Aggregate audit statistics from a mixed set of metric reports.
 *
 * Recognized titles (from `CodeComplexityConfig` formatters):
 * - {@link REPORT_TITLES.cyclomatic} → uses `report.score` as the cyclomatic value
 * - {@link REPORT_TITLES.mi} → uses `report.scorePercent` as the MI value
 *
 * Thresholds for Maintainability Index:
 * - < 65: difficult to maintain
 * - 65–85: moderate
 * - ≥ 85: good
 *
 * Cyclomatic categories:
 * - good:      1–10
 * - moderate:  11–20
 * - bad:       21–40
 * - very bad:  >40
 *
 * @param {MetricReport[]} reports
 * @returns {Object} Categorized counts and newline-joined file lists.
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
 * Build the combined (full) report while still using the per-metric builders.
 * You can pass any `summaryBase` you already have (e.g., SLOC/MI aggregates from escomplex);
 * categorized stats derived from composed reports are appended.
 *
 * @param {Object} params
 * @param {FileComplexityItem[]} params.files
 * @param {MetricId[]} [params.metricIds=['mi','sloc','cyclo','hal']] - Metrics to include.
 * @param {Object} [params.summaryBase] - Existing summary fields to keep (psloc/lsloc/MI averages, etc.).
 * @param {(reports: MetricReport[]) => Object} [params.buildAuditStats] - Derives counts/lists from reports.
 * @returns {{ summary: Object, auditReports: MetricReport[] }} Combined summary and all report entries.
 *
 * @example
 * const { summary, auditReports } = buildFullComplexityReport({
 *   files,
 *   metricIds: ['mi','sloc','cyclo','hal'],
 *   summaryBase,
 *   buildAuditStats,
 * });
 */
export function buildFullComplexityReport({ files, metricIds, summaryBase = {}, buildAuditStats }) {
    const auditReports = composeComplexityReports(files, metricIds);
    const stats = buildAuditStats ? buildAuditStats(auditReports) : {};
    return {
        summary: { ...summaryBase, ...stats },
        auditReports,
    };
}
