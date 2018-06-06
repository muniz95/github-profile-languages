var gulp = require("gulp");
var sass = require("gulp-sass");
var uglify = require("gulp-uglify-es").default;
var cssmin = require("gulp-cssmin");
var htmlmin = require("gulp-htmlmin");
var rename = require("gulp-rename");
var pump = require("pump");
var del = require("del");
var runSequence = require("run-sequence");
var connect = require('gulp-connect');

gulp.task('webserver', function () {
    connect.server({
        livereload: true,
        port: 3000,
        host: '0.0.0.0',
        root: ['dist']
    });
});

gulp.task('browser-sync', function () {
  browserSync.init({
    server: {
      baseDir: "./src"
    }
  });
});

gulp.task('html', function () {
  gulp.src('src/*.html')
    .pipe(connect.reload());
});

gulp.task('js', function () {
  gulp.src('src/js/*.js')
    .pipe(connect.reload());
});

gulp.task('css', function () {
  gulp.src('src/css/*.css')
    .pipe(connect.reload());
});

gulp.task("minify-css", function(cb) {
  console.log("========> Minificando SCSS...");
  pump(
    [
      gulp.src("./src/css/*.css"),
      sass(),
      cssmin(),
      rename({
        suffix: ".min"
      }),
      gulp.dest("./dist/css")
    ],
    cb
  );
});

gulp.task("minify-js", function(cb) {
  console.log("========> Minificando JS...");
  pump(
    [
      gulp.src("./src/js/*.js"),
      uglify(),
      rename({
        suffix: ".min"
      }),
      gulp.dest("./dist/js")
    ],
    cb
  );
});

gulp.task('generate-service-worker', function (callback) {
  var swPrecache = require('sw-precache');
  var dir = 'dist';

  swPrecache.write(`${dir}/sw.js`, {
    staticFileGlobs: [`${dir}/**/*.{js,html,css,png,jpg,gif,svg,eot,ttf,woff}`],
    stripPrefix: dir
  }, callback);
});

gulp.task("pwaify", function(cb) {
  console.log("========> Copiando manifest.json...");
  pump(
    [
      // gulp.src("./sw.js"),
      // uglify(),
      // gulp.dest("./dist"),
      gulp.src("./manifest.json"),
      gulp.dest("./dist")
    ],
    cb
  );
});

gulp.task("minify-html", function(cb) {
  console.log("========> Minificando HTML...");
  pump(
    [
      gulp.src("./src/**/*.html"),
      htmlmin({ collapseWhitespace: true }),
      gulp.dest("./dist")
    ],
    cb
  );
});

gulp.task("copy-assets", function() {
  gulp.src(["./assets/**/*"]).pipe(gulp.dest("./dist/"));
});

gulp.task("clean", function() {
  return del(["./dist/"]);
});

gulp.task("build", function() {
  runSequence("clean", [
    "minify-html",
    "minify-js",
    "minify-css",
    "copy-assets",
    "pwaify",
    "generate-service-worker",
  ]);
});

gulp.task("watch", function() {
  gulp.watch("./src/css/*.css", ["css", "minify-css"]);
  gulp.watch("./src/js/*.js", ["js", "minify-js"]);
  gulp.watch("./src/*.html", ["html", "minify-html"]);
});

gulp.task('default', ['build', 'generate-service-worker', 'webserver', 'watch']);