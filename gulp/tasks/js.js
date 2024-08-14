import webpack from 'webpack-stream'

const js = () => {
  return (
    app.gulp.src(app.path.src.js, { sourcemaps: app.isDev })
      .pipe(app.plugins.plumber(
        app.plugins.notify.onError({
          title: 'JS',
          message: 'Error: <%= error.message %>'
        })
      ))
      .pipe(webpack({
        mode: app.isBuild ? 'production' : 'development',
        output: {
          filename: app.isBuild ? `app.min.${app.version}.js` : 'app.min.js'
        },
        module: {
          rules: [
            // {
            //   test: /\.js$/,
            //   exclude: /node_modules/,
            //   use: {
            //     loader: 'babel-loader',
            //     options: {
            //       presets: ['@babel/preset-env']
            //     }
            //   }
            // },
            {
              test: /\.css$/,
              use: ['style-loader', 'css-loader']
            },
            {
              test: /\.html$/,
              use: [
                {
                  loader: 'html-loader',
                  options: {
                    sources: {
                      list: [
                        '...',
                        {
                          tag: 'img',
                          attribute: 'src',
                          type: 'src',
                          filter: (tag, attribute, attributes, resourcePath) => {
                            return false;
                          }
                        },
                        {
                          tag: 'a',
                          attribute: 'href',
                          type: 'src',
                          filter: (tag, attribute, attributes, resourcePath) => {
                            return false;
                          }
                        },
                        {
                          tag: 'use',
                          attribute: 'xlink:href',
                          type: 'src',
                          filter: (tag, attribute, attributes, resourcePath) => {
                            return false;
                          }
                        }
                      ]
                    }
                  }
                }
              ]
            }
          ]
        },
      }))
      .pipe(app.gulp.dest(app.path.build.js))
      .pipe(app.plugins.browserSync.stream())
  );
}

export default js;

// import esbuild from 'gulp-esbuild';

// const js = () => {
//   return (
//     app.gulp.src(app.path.src.js, { sourcemaps: app.isDev })
//       .pipe(app.plugins.plumber(
//         app.plugins.notify.onError({
//           title: 'JS',
//           message: 'Error: <%= error.message %>',
//         })
//       ))
//       .pipe(esbuild({
//         entryPoints: ['src/js/app.js'], // Указываем входной файл
//         entryNames: app.isBuild ? `app.min.${app.version}` : 'app.min',
//         bundle: true, // Включаем бандлинг
//         outdir: '', // Указываем выходную директорию
//         splitting: true, // Включаем код-сплиттинг
//         format: 'esm', // Используем ESM формат, чтобы поддерживать динамические импорты
//         minify: app.isBuild, // Минификация в режиме продакшена
//         sourcemap: app.isDev, // Генерация sourcemap для отладки
//         target: 'esnext', // Поддержка всех современных возможностей JS
//         loader: {
//           '.js': 'jsx',
//           '.html': 'text',
//           '.css': 'css' // Обработка CSS файлов
//         },
//       }))
//       .pipe(app.gulp.dest(app.path.build.js))
//       .pipe(app.plugins.browserSync.stream())
//   );
// }

// export default js;