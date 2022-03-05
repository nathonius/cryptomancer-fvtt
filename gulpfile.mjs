import gulp from "gulp";
import prefix from "gulp-autoprefixer";
import dartSass from "sass";
import gulpSass from "gulp-sass";

const sass = gulpSass(dartSass);

/* ----------------------------------------- */
/*  Compile Sass
/* ----------------------------------------- */

// Small error handler helper function.
function handleError(err) {
  console.log(err.toString());
  this.emit("end");
}

const SYSTEM_SCSS = ["scss/**/*.scss"];
function compileScss() {
  // Configure options for sass output. For example, 'expanded' or 'nested'
  let options = {
    outputStyle: "expanded",
  };
  return gulp
    .src(SYSTEM_SCSS)
    .pipe(sass(options).on("error", handleError))
    .pipe(
      prefix({
        cascade: false,
      })
    )
    .pipe(gulp.dest("./css"));
}
const css = gulp.series(compileScss);

/* ----------------------------------------- */
/*  Watch Updates
/* ----------------------------------------- */

function watchUpdates() {
  gulp.watch(SYSTEM_SCSS, css);
}

/* ----------------------------------------- */
/*  Export Tasks
/* ----------------------------------------- */

gulp.task("default", gulp.series(compileScss, watchUpdates));
gulp.task("build", gulp.series(compileScss));
gulp.task("css", css);
