const gulp = require('gulp');
const jasmineBrowser = require('gulp-jasmine-browser');
const webpack = require('webpack-stream');

gulp.task('spec', () => {
  return gulp.src('spec/**/*_spec.js')
    .pipe(webpack({module: {
      loaders: [
        {test: /\.js$/, exclude: /node_modules/, loader: 'babel'}
      ]
    }}))
    .pipe(jasmineBrowser.specRunner({console: true}))
    .pipe(jasmineBrowser.headless());
});
