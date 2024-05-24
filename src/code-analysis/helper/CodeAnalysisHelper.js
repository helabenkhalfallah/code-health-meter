import path from 'path';

/**
 * Finds the common base path among a list of files.
 * @param {string[]} files - The list of file paths.
 * @returns {string} - Returns the common base path.
 */
function findCommonBase(files) {
  if (!files || files.length === 0 || files.length === 1) {
    return '';
  }

  const lastSlash = files[0].lastIndexOf(path.sep);

  if (!lastSlash) {
    return '';
  }

  const first = files[0].substr(0, lastSlash + 1);
  let prefixlen = first.length;

  /**
   * Handles the prefixing of a file.
   * @param {string} file - The file to handle.
   */
  function handleFilePrefixing(file) {

    for (let i = prefixlen; i > 0; i--) {
      if (file.substr(0, i) === first.substr(0, i)) {
        prefixlen = i;
        return;
      }
    }
    prefixlen = 0;
  }

  files.forEach(handleFilePrefixing);

  return first.substr(0, prefixlen);
}

export {
  findCommonBase,
};
