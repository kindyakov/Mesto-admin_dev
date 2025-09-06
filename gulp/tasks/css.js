import postcss from 'gulp-postcss';
import tailwindcss from 'tailwindcss';
import autoprefixer from 'autoprefixer';
import cleanCSS from 'gulp-clean-css';
import sourcemaps from 'gulp-sourcemaps';

export const css = () => {
  return app.gulp.src(app.path.src.css)
    .pipe(app.plugins.plumber(
      app.plugins.notify.onError({
        title: "CSS",
        message: "Error: <%= error.message %>"
      })
    ))
    .pipe(app.plugins.if(app.isDev, sourcemaps.init()))
    .pipe(postcss([
      tailwindcss(),
      autoprefixer()
    ]))
    .pipe(app.plugins.if(app.isBuild, cleanCSS({
      level: 2,
      format: 'beautify' // или удалите для минификации
    })))
    .pipe(app.plugins.if(app.isDev, sourcemaps.write('.')))
    .pipe(app.gulp.dest(app.path.build.css))
    .pipe(app.plugins.browserSync.stream());
};