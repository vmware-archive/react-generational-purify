const gulp = require('gulp');
const eslint = require('gulp-eslint');

gulp.task('lint', () => {
  gulp.src(['index.js', 'spec/**/*.js', 'tasks/**/*.js'])
    .pipe(eslint())
    .pipe(eslint.format('stylish'))
    .pipe(eslint.failAfterError());
});
