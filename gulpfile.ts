import * as gulp from "gulp";
import prefix from "gulp-autoprefixer";
import dartSass from "sass";
import gulpSass from "gulp-sass";
import ts from "gulp-typescript";

const tsProject = ts.createProject("tsconfig.json");

const sass = gulpSass(dartSass);

/* ----------------------------------------- */
/*  Compile Sass
/* ----------------------------------------- */

// Small error handler helper function.
function handleError(err: any) {
  console.log(err.toString());
  gulp.emit("end");
}

const SYSTEM_SCSS = ["src/scss/**/*.scss"];
function compileScss() {
  return gulp
    .src(SYSTEM_SCSS)
    .pipe(sass({ outputStyle: "expanded" }).on("error", handleError))
    .pipe(
      prefix({
        cascade: false,
      })
    )
    .pipe(gulp.dest("./dist/css"));
}
const css = gulp.series(compileScss);

/* ----------------------------------------- */
/*  Watch Updates
/* ----------------------------------------- */

function watchUpdates() {
  gulp.watch(SYSTEM_SCSS, css);
}

// Build ts
gulp.task("scripts", function () {
  const tsResult = gulp
    .src("src/**/*.ts") // or tsProject.src()
    .pipe(tsProject());

  return tsResult.js.pipe(gulp.dest("dist"));
});

gulp.task("copy", () => {
  return gulp
    .src("src/**/*{.m?js,.md,.json,.html,.png}")
    .pipe(gulp.dest("dist"));
});

/* ----------------------------------------- */
/*  Export Tasks
/* ----------------------------------------- */

gulp.task("default", gulp.series(compileScss, watchUpdates));
gulp.task("build", gulp.series(compileScss, "scripts", "copy"));
gulp.task("css", css);
