import {
    formatCyclomaticComplexityReport,
    formatFileSLOCIndicators,
    formatHalsteadReports,
    formatMaintainabilityIndexReport,
} from './CodeComplexityConfig.js';

/**
 * Code Complexity Metrics — standalone per-metric builders.
 * Each function consumes precomputed file entries (no IO), so they’re safe to use
 * independently or inside a larger one-pass pipeline.
 *
 * @module CodeComplexityMetrics
 */

/**
 * String identifiers for per-file metrics available from this module.
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

/**
 * Build Maintainability Index reports for a list of files.
 * Standalone & reusable; no filesystem access.
 *
 * @param {FileComplexityItem[]} [files=[]]
 * @returns {MetricReport[]}
 *
 * @example
 * const reports = buildMaintainabilityReports(files);
 */
export function buildMaintainabilityReports(files = []) {
    /** @type {MetricReport[]} */
    const out = [];
    for (const item of files) {
        const { file, fileMaintainability } = item || {};
        if (!file) continue;
        out.push(formatMaintainabilityIndexReport(fileMaintainability, file));
    }
    return out;
}

/**
 * Build SLOC indicator reports (physical/logical) for a list of files.
 *
 * @param {FileComplexityItem[]} [files=[]]
 * @returns {MetricReport[]}
 *
 * @example
 * const reports = buildSLOCReports(files);
 */
export function buildSLOCReports(files = []) {
    /** @type {MetricReport[]} */
    const out = [];
    for (const item of files) {
        const { file, fileSLOC } = item || {};
        if (!file) continue;
        out.push(...formatFileSLOCIndicators(fileSLOC, file));
    }
    return out;
}

/**
 * Build Cyclomatic Complexity reports for a list of files.
 *
 * @param {FileComplexityItem[]} [files=[]]
 * @returns {MetricReport[]}
 *
 * @example
 * const reports = buildCyclomaticReports(files);
 */
export function buildCyclomaticReports(files = []) {
    /** @type {MetricReport[]} */
    const out = [];
    for (const item of files) {
        const { file, fileComplexity } = item || {};
        if (!file) continue;
        const { cyclomatic } = fileComplexity || {};
        out.push(formatCyclomaticComplexityReport(cyclomatic, file));
    }
    return out;
}

/**
 * Build Halstead metric reports for a list of files.
 *
 * @param {FileComplexityItem[]} [files=[]]
 * @returns {MetricReport[]}
 *
 * @example
 * const reports = buildHalsteadMetricReports(files);
 */
export function buildHalsteadMetricReports(files = []) {
    /** @type {MetricReport[]} */
    const out = [];
    for (const item of files) {
        const { file, fileComplexity } = item || {};
        if (!file) continue;
        const { halstead } = fileComplexity || {};
        out.push(...formatHalsteadReports(halstead, file));
    }
    return out;
}

/**
 * Lookup a per-metric builder function by its id.
 *
 * @param {MetricId} id - One of 'mi' | 'sloc' | 'cyclo' | 'hal'.
 * @returns {(files: FileComplexityItem[]) => MetricReport[] | undefined} Builder function, or `undefined` if unknown.
 *
 * @example
 * const build = buildMetricById('cyclo');
 * const reports = build ? build(files) : [];
 */
export const buildMetricById = (id) =>
    ({
        mi: buildMaintainabilityReports,
        sloc: buildSLOCReports,
        cyclo: buildCyclomaticReports,
        hal: buildHalsteadMetricReports,
    })[id];
