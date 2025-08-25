/**
 * Module for performing code modularity audits using Madge and Graphology.
 * It builds a dependency graph (via Madge), runs Louvain community detection,
 * computes graph density and degree-based centralities, and returns a
 * serializable bundle of results (including the original Madge diagnostics).
 *
 * @module CodeModularityAuditor
 */
import AppLogger from '../../commons/AppLogger.js';
import { buildDirectoryTree, buildLouvainGraph } from './CodeModularityBuilder.js';
import { detectCommunities, readDegreeCentralities, readDensity } from './CodeModularityMetrics.js';

/**
 * Madge tree structure: adjacency list mapping module -> dependencies.
 * @typedef {Record<string, string[]>} MadgeTree
 */

/**
 * Louvain details produced by community detection.
 * @typedef {Object} LouvainDetails
 * @property {number} [modularity] - Louvain modularity score.
 * @property {any}    [communities] - Community assignment/details (library-specific).
 * @property {Record<string, number>} [partition] - Optional node→community mapping.
 */

/**
 * Degree-based centralities per node id.
 * @typedef {Object} CentralityMaps
 * @property {Record<string, number>} degreeCentrality
 * @property {Record<string, number>} inDegreeCentrality
 * @property {Record<string, number>} outDegreeCentrality
 */

/**
 * Complete audit result returned by {@link startModularityAudit}.
 * Fields `warnings`, `circular`, `circularGraph`, `orphans`, and `leaves`
 * are forwarded from Madge; `graph` is a Graphology instance.
 *
 * @typedef {Object} CodeModularityAuditResult
 * @property {MadgeTree} tree - Dependency adjacency as reported by Madge.
 * @property {string|Buffer} svg - Madge-produced SVG visualization (raw).
 * @property {import('graphology').Graph} graph - Built Graphology graph.
 * @property {number} [modularity] - Louvain modularity score.
 * @property {any}    [communities] - Louvain communities/details.
 * @property {number} [density] - Graph density in [0,1].
 * @property {Record<string, number>} [degreeCentrality] - Degree centrality map.
 * @property {Record<string, number>} [inDegreeCentrality] - In-degree map.
 * @property {Record<string, number>} [outDegreeCentrality] - Out-degree map.
 * @property {string[]} [warnings] - Madge warnings.
 * @property {string[][]} [circular] - Circular dependency paths.
 * @property {any} [circularGraph] - Madge cycle graph (library-specific).
 * @property {string[]} [orphans] - Modules without dependents.
 * @property {string[]} [leaves] - Leaf modules.
 */

/**
 * Run the full code modularity audit for a directory.
 *
 * Steps:
 *  1) Build the dependency tree & SVG via Madge.
 *  2) Construct a Graphology graph from the tree (+ optional positions).
 *  3) Compute Louvain communities, graph density, and degree centralities.
 *
 * On any failure, returns an empty object `{}` (no throw), and logs the error.
 *
 * @async
 * @param {string} directory - Absolute or relative path to the project root to analyze.
 * @returns {Promise<CodeModularityAuditResult|{}>} Audit result on success; `{}` on failure.
 *
 * @example
 * import { startModularityAudit } from './CodeModularityAuditor.js';
 * const result = await startModularityAudit('.');
 * if (result.graph) {
 *   console.log('Modularity:', result.modularity);
 *   console.log('Density:', result.density);
 * }
 */
export const startModularityAudit = async (directory) => {
    try {
        const { tree, treeVisualization, ...rest } = await buildDirectoryTree(directory);

        if (!tree || !Object.keys(tree)?.length || !treeVisualization) {
            return {};
        }

        const louvainGraph = await buildLouvainGraph(tree, treeVisualization);
        if (!louvainGraph) {
            return {};
        }

        return {
            ...rest,
            tree,
            svg: treeVisualization,
            graph: louvainGraph,
            ...detectCommunities(louvainGraph),
            ...readDensity(louvainGraph),
            ...readDegreeCentralities(louvainGraph),
        };
    } catch (error) {
        AppLogger.info(`[CodeModularityAuditor - startModularityAudit] error:  ${error.message}`);
        return {};
    }
};
