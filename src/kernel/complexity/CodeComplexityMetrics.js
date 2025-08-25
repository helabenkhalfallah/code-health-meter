import {
    formatCyclomaticComplexityReport,
    formatFileSLOCIndicators,
    formatHalsteadReports,
    formatMaintainabilityIndexReport,
} from './CodeComplexityConfig.js';

/**
 * Code Complexity Metrics — standalone per-metric builders.
 * Each function consumes analyzed entries produced by `inspectDirectory()` (no I/O).
 * @module CodeComplexityMetrics
 */

/**
 * String identifiers for per-file metrics.
 * @typedef {'mi'|'sloc'|'cyclo'|'hal'} MetricId
 */

/**
 * A single analyzed entry produced by `inspectDirectory()`.
 * @typedef {Object} AnalyzedFileEntry
 * @property {string} file
 * @property {number} fileMaintainability
 * @property {{ cyclomatic?: number, halstead?: Object }} fileComplexity
 * @property {{ physical?: number, logical?: number }} fileSLOC
 */

/** Legacy alias kept for compatibility. */
/** @typedef {AnalyzedFileEntry} FileComplexityItem */

/**
 * A single formatted metric report entry (as produced by formatters in CodeComplexityConfig).
 * @typedef {Object} MetricReport
 * @property {string} title
 * @property {string} file
 * @property {number=} score
 * @property {number=} scorePercent
 * @property {string=} scoreUnit
 */

/**
 * Build Maintainability Index reports for analyzed entries.
 * @param {AnalyzedFileEntry[]} [entries=[]]
 * @returns {MetricReport[]}
 */
export function buildMaintainabilityReports(entries = []) {
    /** @type {MetricReport[]} */
    const out = [];
    for (const item of entries) {
        const { file, fileMaintainability } = item || {};
        if (!file) continue;
        out.push(formatMaintainabilityIndexReport(fileMaintainability, file));
    }
    return out;
}

/**
 * Build SLOC indicator reports (physical/logical).
 * @param {AnalyzedFileEntry[]} [entries=[]]
 * @returns {MetricReport[]}
 */
export function buildSLOCReports(entries = []) {
    /** @type {MetricReport[]} */
    const out = [];
    for (const item of entries) {
        const { file, fileSLOC } = item || {};
        if (!file) continue;
        out.push(...formatFileSLOCIndicators(fileSLOC, file));
    }
    return out;
}

/**
 * Build Cyclomatic Complexity reports.
 * @param {AnalyzedFileEntry[]} [entries=[]]
 * @returns {MetricReport[]}
 */
export function buildCyclomaticReports(entries = []) {
    /** @type {MetricReport[]} */
    const out = [];
    for (const item of entries) {
        const { file, fileComplexity } = item || {};
        if (!file) continue;
        const { cyclomatic } = fileComplexity || {};
        out.push(formatCyclomaticComplexityReport(cyclomatic, file));
    }
    return out;
}

/**
 * Build Halstead metric reports.
 * @param {AnalyzedFileEntry[]} [entries=[]]
 * @returns {MetricReport[]}
 */
export function buildHalsteadMetricReports(entries = []) {
    /** @type {MetricReport[]} */
    const out = [];
    for (const item of entries) {
        const { file, fileComplexity } = item || {};
        if (!file) continue;
        const { halstead } = fileComplexity || {};
        out.push(...formatHalsteadReports(halstead, file));
    }
    return out;
}

/**
 * Lookup a per-metric builder function by id.
 * @param {MetricId} id - 'mi' | 'sloc' | 'cyclo' | 'hal'
 * @returns {(entries: AnalyzedFileEntry[]) => MetricReport[] | undefined}
 */
export const buildMetricById = (id) =>
    ({
        mi: buildMaintainabilityReports,
        sloc: buildSLOCReports,
        cyclo: buildCyclomaticReports,
        hal: buildHalsteadMetricReports,
    })[id];
