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