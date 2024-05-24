import babelParser from "@babel/eslint-parser";

export default [
  {
    files: ["src/**/*.js", "src/**/*.mjs"],
    languageOptions: {
      parser: babelParser,
      parserOptions: {
        requireConfigFile: false,
        babelOptions: {
          babelrc: false,
          configFile: false,
          // your babel options
          presets: ["@babel/preset-env"],
        }
      }
    }
  }
];