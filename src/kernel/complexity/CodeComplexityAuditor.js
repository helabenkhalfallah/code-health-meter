import AppLogger from '../../commons/AppLogger.js';
import { isAcceptedFileType, isExcludedFile } from '../../commons/AuditUtils.js';
import { buildAuditStats, buildFullComplexityReport } from './CodeComplexityBuilder.js';
import { inspectDirectory } from './CodeComplexityUtils.js';

/**
 * Code Complexity Auditor — builds a full report while allowing per-metric reuse.
 *
 * Pipeline:
 *  1) inspectDirectory(): one-pass analysis (escomplex, SLOC, MI aggregates, per-file data).
 *  2) Filter auditable files (extensions/excludes).
 *  3) Compose per-metric reports using small, standalone metric builders.
 *  4) Merge stats into the summary (keeps original MI/SLOC totals/averages).
 *
 * Reviewers can import individual metrics (via CodeComplexityMetrics) without using this auditor.
 * This module preserves the original full-report behavior for CLI/HTML/JSON outputs.
 *
 * @module CodeComplexityAuditor
 * @see CodeComplexityBuilder#buildFullComplexityReport
 * @see CodeComplexityUtils#inspectDirectory
 */

/**
 * String identifiers for per-file metrics available in the composer.
 * @typedef {'mi'|'sloc'|'cyclo'|'hal'} MetricId
 */

/**
 * A single analyzed file entry produced upstream by inspectDirectory().
 * @typedef {Object} FileComplexityItem
 * @property {string} file
 * @property {number} fileMaintainability
 * @property {{ cyclomatic?: number, halstead?: Record<string, any> }} fileComplexity
 * @property {{ physical?: number, logical?: number }} fileSLOC
 */

/**
 * A single formatted metric report entry (as produced by formatters in CodeComplexityConfig).
 * @typedef {Object} MetricReport
 * @property {string} title
 * @property {string} file
 * @property {number} [score]
 * @property {number} [scorePercent]
 * @property {string} [scoreUnit]
 */

/**
 * Options for startComplexityAudit.
 * @typedef {Object} ComplexityAuditOptions
 * @property {{ ids?: MetricId[] }} [metrics] - Which per-metric builders to run.
 *   @default { ids: ['mi','sloc','cyclo','hal'] }
 * @property {Object} [inspect] - Options forwarded to inspectDirectory (parser, etc.).
 */

/**
 * Result of the complexity audit.
 * @typedef {Object} ComplexityAuditResult
 * @property {Object} summary - Combined summary (original aggregates + categorized stats).
 * @property {MetricReport[]} auditReports - Concatenated per-metric reports for all files.
 */

/**
 * Start Code Complexity Audit (full report), while internally using per-metric builders.
 * Keeps the single-pass performance characteristics and exposes fine-grained metrics via
 * CodeComplexityMetrics.* for reusable consumption.
 *
 * Notes:
 * - Files are filtered by `isAcceptedFileType` / `isExcludedFile`, then sorted ascending
 *   by `fileMaintainability`.
 * - On failure or when no files are found, this returns `{}` (not `null`) to preserve prior API.
 *
 * @async
 * @param {string} directory - Root directory to analyze.
 * @param {ComplexityAuditOptions|Object} options - Audit options. If you already used a flat
 *   options bag, keep doing so; this function reads `options.metrics?.ids` when present and
 *   forwards the rest to `inspectDirectory`.
 * @returns {Promise<ComplexityAuditResult|{}>} Full report `{ summary, auditReports }` or `{}` on failure.
 *
 * @example
 * // Full report with all metrics (default set)
 * const res = await startComplexityAudit('.', { inspect: { // escomplex opts } });
 *
 * @example
 * // Only MI + Cyclomatic
 * const res2 = await startComplexityAudit('.', { metrics: { ids: ['mi','cyclo'] } });
 *
 * @example
 * // Forward inspect options (e.g., TypeScript + JSX)
 * const res3 = await startComplexityAudit('.', {
 *   inspect: { complexity: { // babel/typhon options } }
 * });
 */
export const startComplexityAudit = async (directory, options) => {
    try {
        AppLogger.info(`[CodeComplexityAuditor - startAudit] directory:  ${directory}`);

        if (!directory?.length) return {};

        // Support legacy: some callers pass all options directly; accept both {inspect} or flat
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

        /** @type {FileComplexityItem[]} */
        const auditableFiles = files
            .filter((item) => {
                const fileName = item.file;
                return isAcceptedFileType(fileName) && !isExcludedFile(fileName);
            })
            .sort((a, b) => (a.fileMaintainability > b.fileMaintainability ? 1 : -1));

        /** @type {MetricId[]} */
        const metricIds = options?.metrics?.ids ?? ['mi', 'sloc', 'cyclo', 'hal'];

        const { summary: combinedSummary, auditReports } = buildFullComplexityReport({
            files: auditableFiles,
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
