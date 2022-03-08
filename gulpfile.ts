import "dotenv/config";
import * as gulp from "gulp";
import prefix from "gulp-autoprefixer";
import dartSass from "sass";
import gulpSass from "gulp-sass";
import ts from "gulp-typescript";
import { join } from "path";
import { copy, rm, mkdir, pathExists } from "fs-extra";

const FILE_GLOBS = {
  SCSS: "src/cryptomancer.scss",
  TS: "src/**/*.ts",
  OTHER: "src/**/*{.md,.json,.html,.png}",
};

/**
 * Build styles
 */
gulp.task("scss", () => {
  const sass = gulpSass(dartSass);
  return gulp
    .src(FILE_GLOBS.SCSS)
    .pipe(sass({ outputStyle: "expanded" }).on("error", handleError))
    .pipe(
      prefix({
        cascade: false,
      })
    )
    .pipe(gulp.dest("./dist/css"));
});

/**
 * Build ts
 */
gulp.task("tsc", () => {
  const tsProject = ts.createProject("tsconfig.json");
  const tsResult = gulp.src(FILE_GLOBS.TS).pipe(tsProject());

  return tsResult.js.pipe(gulp.dest("dist"));
});

/**
 * Copy for build
 */
gulp.task("copy-build", () => {
  return gulp.src(FILE_GLOBS.OTHER).pipe(gulp.dest("dist"));
});

/**
 * Empty the dist folder
 */
gulp.task("clean-build", async () => {
  await cleanDir("dist");
});

/**
 * Copy to foundry folder
 */
gulp.task("copy-out", async () => {
  if (process.env.OUT_DIR) {
    // Empty the directory first
    await cleanDir(process.env.OUT_DIR);
    // Copy the files
    await copyDir("dist", process.env.OUT_DIR);
  } else {
    console.log("Not copying to foundry folder, provide OUT_DIR in .env.");
  }
});

/* ----------------------------------------- */
/*  Export Tasks
/* ----------------------------------------- */

gulp.task("build", gulp.series("clean-build", "scss", "tsc", "copy-build"));
gulp.task("serve", gulp.series("build", "copy-out"));
gulp.task("default", gulp.series("build"));
gulp.task("watch", () => {
  gulp.watch(
    [FILE_GLOBS.TS, FILE_GLOBS.SCSS, FILE_GLOBS.OTHER],
    gulp.series("serve")
  );
});

/**
 * Utility Functions
 */

function handleError(err: any): void {
  console.log(err.toString());
  gulp.emit("end");
}

async function copyDir(src: string, dest: string): Promise<void> {
  if (!(await pathExists(dest))) {
    await mkdir(dest);
  }
  await copy(src, dest, { recursive: true, overwrite: true });
}

async function cleanDir(path: string): Promise<void> {
  if (await pathExists(path)) {
    await rm(join(path), { recursive: true });
    await mkdir(path);
  }
}
