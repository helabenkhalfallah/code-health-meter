/**
 * Module for performing code modularity audits using Madge and Graphology.
 * @module CodeModularityAuditor
 */

import AppLogger from '../../commons/AppLogger.js';
import Madge from 'madge';
import xml2js from 'xml2js';
import Graph from 'graphology';
import louvain from 'graphology-communities-louvain';
import {density} from 'graphology-metrics/graph/density.js';
import {
  degreeCentrality,
  inDegreeCentrality,
  outDegreeCentrality
} from 'graphology-metrics/centrality/degree.js';
import AuditUtils from '../../commons/AuditUtils.js';

const {
  madgeDefaultOptions,
  graphologyDefaultOptions,
  louvainDefaultOptions
} = AuditUtils;

/**
 * XML to JavaScript parser instance.
 * @const {xml2js.Parser} xml2jsParser
 */
const xml2jsParser = new xml2js.Parser({});

/**
 * Retrieves project tree data (title, x, y coordinates) from an SVG buffer.
 * @async
 * @function retrieveProjectTreeData
 * @param {Buffer} svgBuffer - The SVG content as a buffer.
 * @returns {Promise<Array<{title: string, x: number, y: number}> | null>} - An array of objects containing title, x, and y coordinates or null on error.
 */
const retrieveProjectTreeData = async (svgBuffer) => {
  try {
    const svgContent = svgBuffer.toString();
    const result = await xml2jsParser.parseStringPromise(svgContent);
    const svg = result.svg;

    const svgData = [];
    const nodes = svg.g[0].g;

    for (const node of nodes) {
      const title = node.title?.[0];
      if(!title?.length) {
        continue;
      }

      const textNode = node.text?.[0]?.$;
      if(!textNode) {
        continue;
      }

      let x = 0;
      let y = 0;

      if (textNode) {
        x = parseFloat(textNode.x);
        y = parseFloat(textNode.y);
      }

      svgData.push({ title, x, y });
    }

    return svgData;
  } catch (error) {
    AppLogger.error('Error parsing SVG content:', error);
    return null;
  }
};

/**
 * Normalizes the project tree structure.
 * @function normalizeProjectTree
 * @param {Object} tree - The project tree object.
 * @returns {Object} - An object containing `nodes` (array of node names) and `edges` (array of [source, target] pairs).
 */
const normalizeProjectTree = (tree) => {
  if(Object.keys(tree).length === 0) {
    return {
      nodes: [],
      edges: []
    };
  }

  return Object.keys(tree).reduce((acc, node) => {
    return  ({
      ...acc,
      nodes: [
        ...(acc.nodes || []),
        node
      ],
      edges: [
        ...(acc.edges || []),
        ...(tree[node]?.map((child) => [node, child]) || [])
      ]
    });
  }, {});
};

/**
 * Starts the code modularity audit process.
 * @async
 * @function startAudit
 * @param {string} directory - The directory to analyze.
 * @returns {Promise<Object>} - An object containing `projectTree`, `projectGraph`, and `projectLouvainDetails` or an empty object on error.
 */
const startAudit = async (directory) => {
  try {
    const projectAnalysisResult = await Madge(directory, madgeDefaultOptions);
    if(!projectAnalysisResult) {
      return ({});
    }

    const projectTree = projectAnalysisResult.obj();
    if(!projectTree
        || !Object.keys(projectTree)?.length) {
      return ({});
    }

    const projectTreeVisualization = await projectAnalysisResult.svg();
    if(!projectTreeVisualization) {
      return ({});
    }

    const { nodes, edges } = normalizeProjectTree(projectTree) || {};
    const projectTreeData =  await retrieveProjectTreeData(projectTreeVisualization);
    const projectGraph = new Graph(graphologyDefaultOptions);

    nodes
      .filter(item => item)
      .reverse()
      .forEach((node, index) => {
        const nodeData = projectTreeData.find((item) => item.title === node);
        if(nodeData) {
          projectGraph.addNode(nodeData.title, {x: nodeData.x, y: nodeData.y});
        }
      });

    edges
      .filter(item => item)
      .reverse()
      .forEach(([source, target]) => {
        projectGraph.addEdge(source, target);
      });

    const louvainDetails = louvain.detailed(projectGraph, louvainDefaultOptions);

    return({
      tree: projectTree,
      graph: projectGraph,
      louvainDetails,
      warnings: projectAnalysisResult.warnings(),
      circular: projectAnalysisResult.circular(),
      circularGraph: projectAnalysisResult.circularGraph(),
      orphans: projectAnalysisResult.orphans(),
      leaves: projectAnalysisResult.leaves(),
      svg: projectTreeVisualization,
      density: density(projectGraph),
      degreeCentrality: degreeCentrality(projectGraph),
      inDegreeCentrality: inDegreeCentrality(projectGraph),
      outDegreeCentrality: outDegreeCentrality(projectGraph),
    });
  } catch (error) {
    AppLogger.info(`[CodeModularityAuditor - startAudit] error:  ${error.message}`);
    return ({});
  }
};

/**
 * The CodeModularityAuditor object containing the `startAudit` function.
 * @const {Object} CodeModularityAuditor
 * @property {function} startAudit - The function to initiate the code modularity audit.
 */
const CodeModularityAuditor = {
  startAudit,
};

export default CodeModularityAuditor;