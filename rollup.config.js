import "dotenv/config";
import copyPlugin from "@guanghechen/rollup-plugin-copy";
import clear from "rollup-plugin-clear";
import typescript from "@rollup/plugin-typescript";
import styles from "rollup-plugin-styles";
import { terser } from "rollup-plugin-terser";
import node from "@rollup/plugin-node-resolve";
import replace from "@rollup/plugin-replace";

const isProd = process.env.NODE_ENV === "production";
const isDev = !isProd;
const name = "cryptomancer";
const distDirectory = "dist";
const srcDirectory = "src";

const staticFiles = `${srcDirectory}/**/*{.md,.json,.html,.hbs,.png,.otf,.db}`;

// build to dist and foundry folder during watch
const outputDirs = [distDirectory];
if (isDev && process.env.OUT_DIR) {
  outputDirs.push(process.env.OUT_DIR);
}

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
  output: outputDirs.map((dir) => ({
    dir,
    format: "es",
    sourcemap: true,
    assetFileNames: "[name].[ext]",
  })),
  plugins: [
    environment(process.env.NODE_ENV),
    clear({ targets: outputDirs }),
    node(),
    typescript({ noEmitOnError: isProd }),
    replace({
      preventAssignment: true,
      values: {
        "process.env.NODE_ENV": isProd
          ? JSON.stringify("production")
          : JSON.stringify("development"),
      },
    }),
    styles({
      mode: ["extract", `${name}.css`],
      url: false,
      sourceMap: true,
      minimize: isProd,
    }),
    copyPlugin({
      targets: outputDirs.map((dest) => ({ src: staticFiles, dest })),
      copyOnce: false,
    }),
    isProd && terser({ ecma: 2020, keep_fnames: true, keep_classnames: true }),
  ],
};

export default config;
