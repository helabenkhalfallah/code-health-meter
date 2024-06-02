import crypto from 'crypto';
import glob from 'globby';
import unixify from 'unixify';
import lodash from 'lodash';
import AppLogger from './AppLogger.js';

/**
 * Checks if a file is of an accepted type.
 * @param {string} fileName - The name of the file.
 * @returns {boolean} - Returns true if the file is of an accepted type, false otherwise.
 */
const isAcceptedFileType = (fileName) => (
  fileName?.endsWith('.js') ||
    fileName?.endsWith('.jsx') ||
    fileName?.endsWith('.ts') ||
    fileName?.endsWith('.tsx') ||
    false
);

/**
 * Checks if a file is excluded.
 * @param {string} filePath - The path of the file.
 * @returns {boolean} - Returns true if the file is excluded, false otherwise.
 */
const isExcludedFile = (filePath) => (
  filePath?.toLowerCase()?.includes('snap') ||
    filePath?.toLowerCase()?.includes('mock') ||
    filePath?.toLowerCase()?.includes('jest') ||
    filePath?.toLowerCase()?.includes('webpack') ||
    filePath?.toLowerCase()?.includes('public') ||
    filePath?.toLowerCase()?.includes('cypress') ||
    filePath?.toLowerCase()?.includes('gitlab') ||
    filePath?.toLowerCase()?.includes('deploy') ||
    filePath?.toLowerCase()?.includes('target') ||
    filePath?.toLowerCase()?.includes('node_modules') ||
    filePath?.toLowerCase()?.includes('report-complexity') ||
    filePath?.toLowerCase()?.includes('eslint') ||
    filePath?.toLowerCase()?.includes('babel') ||
    filePath?.toLowerCase()?.includes('husky') ||
    filePath?.toLowerCase()?.includes('postcss') ||
    filePath?.toLowerCase()?.includes('routes') ||
    filePath?.toLowerCase()?.includes('path') ||
    filePath?.toLowerCase()?.includes('dico') ||
    filePath?.toLowerCase()?.includes('redux') ||
    filePath?.toLowerCase()?.includes('/dist/') ||
    filePath?.toLowerCase()?.includes('/bff/') ||
    filePath?.toLowerCase()?.includes('/wsclient/') ||
    filePath?.toLowerCase()?.includes('/js/index.js') ||
    filePath?.toLowerCase()?.includes('/ts/index.ts') ||
    filePath?.toLowerCase()?.includes('test') ||
    filePath?.toLowerCase()?.includes('spec')  ||
    filePath?.toLowerCase()?.endsWith('.d.ts')  ||
    filePath?.toLowerCase()?.endsWith('.config.js')  ||
    filePath?.toLowerCase()?.endsWith('.config.ts')  ||
    filePath?.toLowerCase()?.includes('/types/') ||
    filePath?.toLowerCase()?.includes('type') ||
    filePath?.toLowerCase()?.includes('index') ||
    filePath?.toLowerCase()?.includes('dico') ||
    false
);

/**
 * Converts a pattern to a file.
 * @param {string} pattern - The pattern to convert.
 * @returns {Array} - Returns an array containing the files.
 */
const patternToFile = (pattern) => glob.sync(unixify(pattern));

/**
 * Retrieves all files from a specified directory.
 *
 * @param {string} srcDir - The source directory to retrieve files from.
 * @returns {Array|null} An array of files from the source directory, or null if the source directory is not specified or an error occurs.
 */
const getFiles = (srcDir) => {
  try{
    AppLogger.info(`[AuditUtils - parseFiles] srcDir:  ${srcDir}`);

    if (!srcDir || !srcDir.length) {
      return null;
    }

    const files = lodash
      .chain([
        srcDir,
      ])
      .map(patternToFile)
      .flatten()
      .value();

    AppLogger.info(`[AuditUtils - parseFiles] files:  ${files?.length}`);

    return files;
  }catch (error) {
    AppLogger.info(`[AuditUtils - parseFiles] error:  ${error.message}`);
    return null;
  }
};

/**
 * Generate Hash for value string
 * @param {string} value - Value to hashify
 * @returns {string | null}
 */
const generateHash = (value) => {
  if(!value){
    return null;
  }
  return crypto
    .createHash('md5')
    .update(JSON.stringify(value))
    .digest('hex');
};

const AuditUtils = {
  isAcceptedFileType,
  isExcludedFile,
  getFiles,
  generateHash,
};

export default AuditUtils;
