import PrettierImportConfig from '@trivago/prettier-plugin-sort-imports';

/**
 * @see https://prettier.io/docs/en/configuration.html
 * @type {import("prettier").Config}
 */
const config = {
    trailingComma: 'all',
    tabWidth: 4,
    semi: true,
    singleQuote: true,
    printWidth: 100,
    plugins: [PrettierImportConfig],
    importOrder: ['^@ui/(.*)$', '^@server/(.*)$', '^[./]'],
    importOrderSeparation: true,
    importOrderSortSpecifiers: true,
};

export default config;
