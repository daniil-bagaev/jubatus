const
    gulp = require('gulp'),
    $ = require('gulp-load-plugins')({
        debug: true
    }),
    dir = require('./config/paths.json');
gulp
    .task('pug:compile', () => {
        return gulp
            .src(dir.src.pug)
            .pipe($.pug({
                pretty: '\t'
            }))
            .pipe(gulp.dest(dir.pub.main))
    });
gulp
    .task('pug:watch', () => {
        $.watch(dir.src.pug, gulp.series('pug:compile'));
    });
gulp
    .task('pug', gulp.series('pug:compile', 'pug:watch'));

gulp
    .task('less:compile', () => {
        return gulp
            .src(dir.src.less)
            .pipe($.less())
            .pipe(gulp.dest(dir.pub.css))
    });
gulp
    .task('less:watch', () => {
        $.watch(dir.src.less, gulp.series('less:compile'));
    });
gulp
    .task('less', gulp.series('less:compile', 'less:watch'));
