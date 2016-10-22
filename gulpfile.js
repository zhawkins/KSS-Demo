'use strict';

//=======================================================
// Include gulp
//=======================================================
var gulp = require('gulp');

//=======================================================
// Include Our Plugins
//=======================================================
var sass        = require('gulp-sass');
var prefix      = require('gulp-autoprefixer');
var sync        = require('browser-sync');
var rename      = require('gulp-rename');
var path        = require('path');
var del         = require('del');
var runSequence = require('run-sequence');
var kss         = require('kss');

//=======================================================
// Compile Our Sass
//=======================================================
// Compile Sass
gulp.task('compile', function() {
  return gulp.src('./src/{global,layout,components}/**/*.scss')
    .pipe(sass({ outputStyle: 'nested' })
      .on('error', sass.logError))
    .pipe(prefix({
      browsers: ['last 2 versions'],
      cascade: false
    }))
    .pipe(rename(function (path) {
      path.dirname = '';
      return path;
    }))
    .pipe(gulp.dest('./dist/css'))
    .pipe(sync.stream());
});

//=======================================================
// Generate style guide
//=======================================================
gulp.task('styleguide', function() {
  return kss({
    source: [
      'src/global',
      'src/components',
      'src/layout'
    ],
    destination: './dist/style-guide',
    builder: 'src/style-guide/builder',
    namespace: 'tacocat:' + __dirname + '/src/components/',
    'extend-drupal8': true,
    'verbose': true,
    // The css and js paths are URLs, like '/misc/jquery.js'.
    // The following paths are relative to the generated style guide.
    css: [
      path.relative(
        __dirname + '/style-guide/',
        __dirname + '/css/global.css'
      ),
      path.relative(
        __dirname + '/style-guide/',
        __dirname + '/css/btn.css'
      ),
      path.relative(
        __dirname + '/style-guide/',
        __dirname + '/css/teaser.css'
      ),
      path.relative(
        __dirname + '/style-guide/',
        __dirname + '/css/l-center.css'
      )
    ],
    js: [
      '../../src/components/teaser/teaser.js'
    ],
    homepage: 'style-guide.md',
    title: 'Style Guide'
  });
});

//=======================================================
// Clean all directories.
//=======================================================
gulp.task('clean', ['clean:css', 'clean:styleguide']);

// Clean style guide files.
gulp.task('clean:styleguide', function () {
  // You can use multiple globbing patterns as you would with `gulp.src`
  return del([
    './dist/style-guide/*'
  ], {force: true});
});

// Clean CSS files.
gulp.task('clean:css', function () {
  return del([
    './dist/css/*'
  ], {force: true});
});

//=======================================================
// Watch and recompile sass.
//=======================================================
gulp.task('watch', function() {

  // Watch all my sass files and compile sass if a file changes.
  gulp.watch(
    './src/{global,layout,components}/**/*.scss',
    ['lint:sass', 'compile:sass']
  );

  // Watch all my twig files and rebuild the style guide if a file changes.
  gulp.watch(
    './src/{layout,components}/**/*.twig',
    ['watch:styleguide']
  );
});

//=======================================================
// Default Task
//
// runSequence runs 'clean' first, and when that finishes
// 'compile', 'styleguide' run at the same time.
//=======================================================
gulp.task('default', function(callback) {
  runSequence(
    'clean',
    ['compile', 'styleguide'],
    callback
  );
});
