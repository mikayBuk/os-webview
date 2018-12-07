const gulp = require('gulp');
require('require-dir')('./gulp/tasks', {recurse: true});

gulp.task('before-webpack', gulp.series(
    'clean',
    gulp.parallel(
        'copy',
        gulp.series(
            'favicon',
            'html'
        ),
        'styles',
        'scripts',
        'templates',
        'images'
    )
));

gulp.task('default', gulp.series(
    'before-webpack',
    'webpack'
));

gulp.task('dev-build', gulp.series(
    'development',
    'default'
));

gulp.task('dist-build', gulp.series(
    'production',
    'default'
));

gulp.task('dev', gulp.series(
    'development',
    'before-webpack',
    'copySettings',
    gulp.parallel(
        'watch',
        'webpack'
    )
));

gulp.task('dist', gulp.series(
    'production',
    'default',
    'precache',
    'humans'
));

gulp.task('lint', gulp.parallel(
    'scsslint',
    'eslint'
));

gulp.task('test', gulp.series(
    'development',
    'before-webpack'
));
