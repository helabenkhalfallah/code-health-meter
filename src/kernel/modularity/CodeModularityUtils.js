/**
 * Module providing utilities for code modularity audits.
 * @module CodeModularityUtils
 */
import fs from 'fs-extra';
import path from 'path';
import xml2js from 'xml2js';

import AppLogger from '../../commons/AppLogger.js';
import CodeModularityConfig from './CodeModularityConfig.js';

/**
 * @typedef {Object} CodeModularityOptions
 * @property {string} outputDir - Output directory for the report files.
 * @property {('json'|'html')} fileFormat - Desired output format.
 */

/**
 * @typedef {Object} NumberByNode
 * @property {number} [key] - Numeric value by node id (index signature for docs only).
 */

/**
 * @typedef {Object} CentralityMaps
 * @property {Record<string, number>} degreeCentrality - Degree centrality per node.
 * @property {Record<string, number>} inDegreeCentrality - In-degree centrality per node.
 * @property {Record<string, number>} outDegreeCentrality - Out-degree centrality per node.
 */

/**
 * @typedef {Object} DensityResult
 * @property {number} density - Graph density in [0,1].
 */

/**
 * @typedef {Object} LouvainDetails
 * @property {number} [modularity] - Louvain modularity score.
 * @property {any} [communities] - Community assignment details (library-specific shape).
 * @property {Record<string, number>} [partition] - Optional mapping node -> community id.
 */

/**
 * @typedef {Object} DirectoryTreeBuildResult
 * @property {Record<string, string[]>} tree - Adjacency object from Madge (module -> deps).
 * @property {Buffer|string} treeVisualization - SVG output from Madge.
 * @property {string[]} warnings - Madge warnings.
 * @property {string[][]} circular - List of circular dependency paths.
 * @property {any} circularGraph - Graph representation of cycles (Madge-specific).
 * @property {string[]} orphans - Modules without dependents.
 * @property {string[]} leaves - Leaf modules.
 */

/**
 * @typedef {Object} DirectoryTreeNormalized
 * @property {string[]} nodes - List of node ids.
 * @property {Array<[string,string]>} edges - Directed edges [source, target].
 */

/**
 * XML to JavaScript parser instance.
 * @const {xml2js.Parser}
 */
const xml2jsParser = new xml2js.Parser({});

/**
 * Formats the code modularity audit reports based on the specified file format.
 *
 * @function formatCodeModularityAuditReports
 * @param {Object} options - Options for formatting.
 * @param {('json'|'html')} options.fileFormat - The desired output file format.
 * @param {Object} options.reports - The detailed results of the Modularity Analysis.
 * @returns {string} The formatted report content.
 * @example
 * const text = formatCodeModularityAuditReports({ fileFormat: 'json', reports: { density: 0.2 } });
 */
export const formatCodeModularityAuditReports = ({ fileFormat, reports }) => {
    if (!reports) {
        return '';
    }

    if (fileFormat === 'json') {
        return JSON.stringify(reports, null, 2);
    }

    if (fileFormat === 'html') {
        return CodeModularityConfig.formatCodeModularityHtmlReports(reports);
    }

    return '';
};

/**
 * Writes the code modularity audit results to a file.
 *
 * @function writeCodeModularityAuditToFile
 * @param {Object} options - Options for writing the audit results.
 * @param {CodeModularityOptions} options.codeModularityOptions - Code modularity audit options.
 * @param {Object} options.codeModularityAnalysisResult - Results of the code modularity analysis.
 * @param {LouvainDetails} options.codeModularityAnalysisResult.louvainDetails - Louvain details.
 * @param {DensityResult|Object} options.codeModularityAnalysisResult.density - Density result.
 * @param {CentralityMaps|Object} options.codeModularityAnalysisResult.degreeCentrality - Degree map.
 * @param {CentralityMaps|Object} options.codeModularityAnalysisResult.inDegreeCentrality - In-degree map.
 * @param {CentralityMaps|Object} options.codeModularityAnalysisResult.outDegreeCentrality - Out-degree map.
 * @param {string|Buffer} [options.codeModularityAnalysisResult.svg] - Optional SVG string to persist.
 * @returns {boolean} `true` if the write operation was successful, `false` otherwise.
 * @example
 * writeCodeModularityAuditToFile({
 *   codeModularityOptions: { outputDir: 'out', fileFormat: 'json' },
 *   codeModularityAnalysisResult: { louvainDetails: { modularity: 0.5 } }
 * });
 */
export const writeCodeModularityAuditToFile = ({
    codeModularityOptions,
    codeModularityAnalysisResult,
}) => {
    try {
        const { outputDir, fileFormat } = codeModularityOptions || {};

        AppLogger.info(
            `[CodeModularityUtils - writeCodeModularityAuditToFile] outputDir:  ${outputDir}`,
        );
        AppLogger.info(
            `[CodeModularityUtils - writeCodeModularityAuditToFile] fileFormat:  ${fileFormat}`,
        );

        if (!outputDir?.length) {
            return false;
        }

        if (!codeModularityAnalysisResult) {
            return false;
        }

        const {
            louvainDetails,
            density,
            degreeCentrality,
            inDegreeCentrality,
            outDegreeCentrality,
            svg,
        } = codeModularityAnalysisResult;

        AppLogger.info('[CodeModularityUtils - startAudit] louvainDetails:', louvainDetails);
        AppLogger.info('[CodeModularityUtils - startAudit] density:', density);
        AppLogger.info('[CodeModularityUtils - startAudit] degreeCentrality:', degreeCentrality);
        AppLogger.info(
            '[CodeModularityUtils - startAudit] inDegreeCentrality:',
            inDegreeCentrality,
        );
        AppLogger.info(
            '[CodeModularityUtils - startAudit] outDegreeCentrality:',
            outDegreeCentrality,
        );

        const codeModularityAuditOutputFileName = `CodeModularityReport.${fileFormat || 'json'}`;
        AppLogger.info(
            `[CodeModularityUtils - writeCodeComplexityAuditToFile] codeModularityAuditOutputFileName:  ${codeModularityAuditOutputFileName}`,
        );

        const codeModularityAuditOutputFile = path.join(
            outputDir,
            codeModularityAuditOutputFileName,
        );
        AppLogger.info(
            `[CodeModularityUtils - writeCodeComplexityAuditToFile] codeModularityAuditOutputFile:  ${codeModularityAuditOutputFile}`,
        );

        const svgOutputFileName = 'CodeModularityReport.svg';
        AppLogger.info(
            `[CodeModularityUtils - writeCodeComplexityAuditToFile] svgOutputFileName:  ${svgOutputFileName}`,
        );

        const svgOutputFile = path.join(outputDir, svgOutputFileName);
        AppLogger.info(
            `[CodeModularityUtils - writeCodeComplexityAuditToFile] svgOutputFile:  ${svgOutputFile}`,
        );

        if (fs.existsSync(codeModularityAuditOutputFile)) {
            fs.rmSync(codeModularityAuditOutputFile);
        } else {
            fs.mkdirSync(outputDir, { recursive: true });
        }

        const formattedModularityAuditReports = formatCodeModularityAuditReports({
            fileFormat,
            reports: {
                modularity: louvainDetails?.modularity,
                communities: louvainDetails?.communities,
                density,
                degreeCentrality,
                inDegreeCentrality,
                outDegreeCentrality,
                svgFile: svgOutputFileName,
            },
        });

        if (!formattedModularityAuditReports?.length) {
            return false;
        }

        fs.writeFileSync(codeModularityAuditOutputFile, formattedModularityAuditReports);

        if (svg) {
            if (fs.existsSync(svgOutputFile)) {
                fs.rmSync(svgOutputFile);
            }
            fs.writeFileSync(svgOutputFile, svg);
        }

        return true;
    } catch (error) {
        AppLogger.info(
            `[CodeModularityUtils - writeCodeModularityAuditToFile] error:  ${error.message}`,
        );
        return false;
    }
};

/**
 * Parse Madge SVG output and extract node labels with their x/y positions.
 *
 * **Note:** This is optional and may be brittle across Madge versions as layout details change.
 *
 * @param {Buffer|string} svgBuffer - SVG buffer or string produced by Madge.
 * @returns {Array<{title: string, x: number, y: number}>|null} List of labeled positions or `null` on failure.
 */
export const retrieveDirectoryTreeData = async (svgBuffer) => {
    try {
        const svgContent = svgBuffer.toString();
        const result = await xml2jsParser.parseStringPromise(svgContent);
        const svg = result.svg;

        const svgData = [];
        const nodes = svg.g[0].g;

        for (const node of nodes) {
            const title = node.title?.[0];
            if (!title?.length) {
                continue;
            }

            const textNode = node.text?.[0]?.$;
            if (!textNode) {
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
 * Normalize a Madge adjacency object into a flat list of nodes and directed edges.
 *
 * @param {Record<string, string[]>} tree - Madge object() output.
 * @returns {DirectoryTreeNormalized} Normalized nodes and edges.
 */
export const normalizeDirectoryTree = (tree) => {
    if (Object.keys(tree).length === 0) {
        return {
            nodes: [],
            edges: [],
        };
    }

    return Object.keys(tree).reduce((acc, node) => {
        return {
            ...acc,
            nodes: [...(acc.nodes || []), node],
            edges: [...(acc.edges || []), ...(tree[node]?.map((child) => [node, child]) || [])],
        };
    }, {});
};
