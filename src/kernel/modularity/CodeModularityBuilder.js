import Graph from 'graphology';
import Madge from 'madge';

import AppLogger from '../../commons/AppLogger.js';
import { graphologyDefaultOptions, madgeDefaultOptions } from '../../commons/AuditUtils.js';
import { normalizeDirectoryTree, retrieveDirectoryTreeData } from './CodeModularityUtils.js';

/**
 * Build a directory dependency tree using Madge and return both data and SVG.
 *
 * @async
 * @param {string} directory - Root directory to analyze.
 * @returns {Promise<DirectoryTreeBuildResult|{}>} Tree, visualization, and auxiliary arrays or empty object on failure.
 * @example
 * const { tree, treeVisualization } = await buildDirectoryTree('.')
 */
export const buildDirectoryTree = async (directory) => {
    try {
        const directoryAnalysisResult = await Madge(directory, madgeDefaultOptions);
        if (!directoryAnalysisResult) {
            return {};
        }

        const directoryTree = directoryAnalysisResult.obj();
        if (!directoryTree || !Object.keys(directoryTree)?.length) {
            return {};
        }

        const directoryTreeVisualization = await directoryAnalysisResult.svg();
        if (!directoryTreeVisualization) {
            return {};
        }

        return {
            tree: directoryTree,
            treeVisualization: directoryTreeVisualization,
            warnings: directoryAnalysisResult.warnings(),
            circular: directoryAnalysisResult.circular(),
            circularGraph: directoryAnalysisResult.circularGraph(),
            orphans: directoryAnalysisResult.orphans(),
            leaves: directoryAnalysisResult.leaves(),
        };
    } catch (error) {
        AppLogger.info(`[CodeModularityBuilder - buildDirectoryGraph] error:  ${error.message}`);
        return {};
    }
};

/**
 * Build a Graphology graph from a Madge tree and (optionally) node positions parsed from SVG.
 *
 * @async
 * @param {Record<string, string[]>} directoryTree - Madge adjacency object.
 * @param {Buffer|string} directoryTreeVisualization - Madge SVG output used to recover positions.
 * @returns {Promise<import('graphology').Graph|null>} A Graphology graph or null on error.
 */
export const buildLouvainGraph = async (directoryTree, directoryTreeVisualization) => {
    try {
        const { nodes, edges } = normalizeDirectoryTree(directoryTree) || {};
        const projectTreeData = await retrieveDirectoryTreeData(directoryTreeVisualization);
        const projectGraph = new Graph(graphologyDefaultOptions);

        nodes
            .filter((item) => item)
            .reverse()
            .forEach((node) => {
                const nodeData = projectTreeData.find((item) => item.title === node);
                if (nodeData) {
                    projectGraph.addNode(nodeData.title, { x: nodeData.x, y: nodeData.y });
                }
            });

        edges
            .filter((item) => item)
            .reverse()
            .forEach(([source, target]) => {
                projectGraph.addEdge(source, target);
            });

        return projectGraph;
    } catch (error) {
        AppLogger.info(`[CodeModularityBuilder - buildDirectoryGraph] error:  ${error.message}`);
        return null;
    }
};
