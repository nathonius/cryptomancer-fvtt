import copy from "@guanghechen/rollup-plugin-copy";
import typescript from "@rollup/plugin-typescript";
import livereload from "rollup-plugin-livereload";
import styles from "rollup-plugin-styles";
import { terser } from "rollup-plugin-terser";

const name = "cryptomancer";
const distDirectory = "dist";
const srcDirectory = "src";

const staticFiles = `${srcDirectory}/**/*{.md,.json,.html,.hbs,.png,.otf,.db}`;

const isProd = process.env.NODE_ENV === "production";
const isDev = !isProd;

/**
 * this simple plugin displays which environment we're in when rollup starts
 * @param {string} environment - the environment to display
 */
const environment = (environment) => {
  /** @type {import('rollup').PluginContext} */
  const plugin = {
    name: "environment",
    buildStart() {
      console.log("\x1b[32m%s%s\x1b[0m", "Environment: ", environment);
    },
  };
  return plugin;
};

/** @type {import('rollup').RollupOptions} */
const config = {
  input: { [`${name}`]: `${srcDirectory}/${name}.ts` },
  output: {
    dir: distDirectory,
    format: "es",
    sourcemap: true,
    assetFileNames: "[name].[ext]",
  },
  plugins: [
    environment(process.env.NODE_ENV),
    typescript({ noEmitOnError: isProd }),
    styles({
      mode: ["extract", `${name}.css`],
      url: false,
      sourceMap: true,
      minimize: isProd,
    }),
    copy({
      targets: [
        {
          src: staticFiles,
          dest: distDirectory,
        },
      ],
    }),
    isDev && livereload(distDirectory),
    isProd && terser({ ecma: 2020, keep_fnames: true, keep_classnames: true }),
  ],
};

export default config;
