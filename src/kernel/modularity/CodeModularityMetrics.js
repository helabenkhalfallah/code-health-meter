import louvain from 'graphology-communities-louvain';
import {
    degreeCentrality,
    inDegreeCentrality,
    outDegreeCentrality,
} from 'graphology-metrics/centrality/degree.js';
import { density } from 'graphology-metrics/graph/density.js';

import AppLogger from '../../commons/AppLogger.js';
import { louvainDefaultOptions } from '../../commons/AuditUtils.js';

/**
 * Run Louvain community detection and return detailed results.
 *
 * @param {import('graphology').Graph} louvainGraph - Graphology graph to analyze.
 * @returns {LouvainDetails|{}} Object containing modularity and communities or empty object on error.
 */
export const detectCommunities = (louvainGraph) => {
    try {
        return louvain.detailed(louvainGraph, louvainDefaultOptions) || {};
    } catch (error) {
        AppLogger.info(`[CodeModularityAuditor - buildLouvainDetails] error:  ${error.message}`);
        return {};
    }
};

/**
 * Compute degree-based centrality maps for all nodes.
 *
 * @param {import('graphology').Graph} louvainGraph - Graphology graph to measure.
 * @returns {CentralityMaps} Degree, in-degree and out-degree centrality maps. Nulls when graph is missing.
 */
export const readDegreeCentralities = (louvainGraph) => {
    if (!louvainGraph) {
        return {
            degreeCentrality: null,
            inDegreeCentrality: null,
            outDegreeCentrality: null,
        };
    }
    return {
        degreeCentrality: degreeCentrality(louvainGraph),
        inDegreeCentrality: inDegreeCentrality(louvainGraph),
        outDegreeCentrality: outDegreeCentrality(louvainGraph),
    };
};

/**
 * Compute the overall density of the graph.
 *
 * @param {import('graphology').Graph} louvainGraph - Graphology graph to measure.
 * @returns {DensityResult|{density: null}} Density value in [0,1] or null when graph is missing.
 */
export const readDensity = (louvainGraph) => {
    if (!louvainGraph) {
        return {
            density: null,
        };
    }
    return {
        density: density(louvainGraph),
    };
};
