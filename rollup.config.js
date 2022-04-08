import "dotenv/config";
import copyPlugin from "@guanghechen/rollup-plugin-copy";
import typescript from "@rollup/plugin-typescript";
import styles from "rollup-plugin-styles";
import { terser } from "rollup-plugin-terser";
import svelte from "rollup-plugin-svelte";
import sveltePreprocess from "svelte-preprocess";
import nodeResolve from "@rollup/plugin-node-resolve";
import { copy, mkdir, pathExists, rm } from "fs-extra";
import { join } from "path";

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

const serve = (outDir) => ({
  name: "serve",
  writeBundle: async () => {
    if (outDir) {
      // Empty the directory first
      await cleanDir(outDir);
      // Copy the files
      await copyDir(distDirectory, outDir);
      console.log(`Wrote out to ${outDir}`);
    } else {
      console.log("Not copying to foundry folder, provide OUT_DIR in .env.");
    }
  },
});

/** @type {import('rollup').RollupOptions} */
const config = {
  input: { [`${name}`]: `${srcDirectory}/${name}.ts` },
  output: {
    dir: distDirectory,
    format: "commonjs",
    sourcemap: true,
    assetFileNames: "[name].[ext]",
  },
  plugins: [
    nodeResolve(),
    environment(process.env.NODE_ENV),
    svelte({
      preprocess: sveltePreprocess({ sourceMap: isDev }),
      compilerOptions: {
        // enable run-time checks when not in production
        dev: isDev,
      },
    }),
    typescript({ noEmitOnError: isProd }),
    styles({
      mode: ["extract", `${name}.css`],
      url: false,
      sourceMap: true,
      minimize: isProd,
    }),
    copyPlugin({
      targets: [
        {
          src: staticFiles,
          dest: distDirectory,
        },
      ],
    }),
    isProd && terser({ ecma: 2020, keep_fnames: true, keep_classnames: true }),
    isDev && process.env.OUT_DIR && serve(process.env.OUT_DIR),
  ],
};

async function copyDir(src, dest) {
  if (!(await pathExists(dest))) {
    await mkdir(dest);
  }
  await copy(src, dest, { recursive: true, overwrite: true });
}

async function cleanDir(path) {
  if (await pathExists(path)) {
    await rm(join(path), { recursive: true });
    await mkdir(path);
  }
}

export default config;
