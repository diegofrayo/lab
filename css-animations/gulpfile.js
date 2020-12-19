//------------------------------------------------------------------
//-------------- Load Plugins And Their Settings -------------------
const gulp = require("gulp");
const g = require("gulp-load-plugins")({ lazy: false });
const browserSync = require("browser-sync").create();

const HTML_MIN_OPTS = {
  removeComments: true,
  collapseWhitespace: true,
  removeEmptyAttributes: false,
  collapseBooleanAttributes: true,
  removeRedundantAttributes: true,
};

let environment = "dev";
let destPath = "./build";

//--------------------------------------------------------------
//------------------------- Util Functions ---------------------
const buildJS = () => {
  let stream = gulp
    .src(`${__dirname}/src/scripts.js`)
    .pipe(g.babel({ presets: ["env"] }));

  if (environment === "production") {
    stream = stream.pipe(g.uglify());
  }

  return stream;
};

const buildCSS = () => {
  let stream = gulp.src(`${__dirname}/src/styles.less`).pipe(g.less());

  if (environment === "production") {
    stream = stream.pipe(g.minifyCss());
  }

  return stream;
};

const buildHTML = () => {
  let stream = gulp.src(`${__dirname}/src/template.html`);
  let cssText;

  buildCSS()
    .on("data", (file) => (cssText = file.contents.toString()))
    .on("end", () => {
      stream = stream.pipe(g.replace("/*INJECT:CSS*/", cssText));

      let jsText;

      buildJS()
        .on("data", (file) => (jsText = file.contents.toString()))
        .on("end", () => {
          stream = stream
            .pipe(g.replace("//INJECT:JS", jsText))
            .pipe(g.rename("index.html"));

          if (environment === "production") {
            stream = stream.pipe(g.htmlmin(HTML_MIN_OPTS));
          }

          stream.pipe(gulp.dest(destPath));

          g.util.log(
            `BUILD CSS ANIMATIONS PAGE FILES => ${new Date().toLocaleString()}`
          );
        });
    });
};

const copyAssets = () => {
  gulp
    .src([
      `${__dirname}/src/images/*.ico`,
      `${__dirname}/src/images/*.png`,
      `${__dirname}/src/images/*.svg`,
      `${__dirname}/src/images/*.jpg`,
    ])
    .pipe(
      gulp.dest(
        environment === "production"
          ? `${destPath}/images`
          : `${destPath}/css-animations/images`
      )
    );
};

const createServer = () => {
  browserSync.init({
    server: {
      baseDir: "./build",
    },
  });
};

//-------------------------------------------------------
//----------------- Main Tasks --------------------------
gulp.task("watch", () => {
  createServer();
  buildHTML();
  copyAssets();
  gulp
    .watch(
      ["./src/template.html", "./src/styles.less", "./src/scripts.js"],
      buildHTML
    )
    .on("change", browserSync.reload);
});

gulp.task("default", ["watch"]);

//-------------------------------------------------------
//----------------- Builds Tasks ------------------------
gulp.task("build-production", () => {
  environment = "production";
  destPath = "./../website-router/public/css-animations";
  buildHTML();
  copyAssets();
});
