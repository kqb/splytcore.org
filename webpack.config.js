const fs = require('fs');
const path = require('path');
const glob = require('glob');
const Webpack = require('webpack');
const HtmlWebPackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const ImageMinimizerPlugin = require('image-minimizer-webpack-plugin');
const imageminGifsicle = require("imagemin-gifsicle");
const imageminPngquant = require("imagemin-pngquant");
const imageminSvgo = require("imagemin-svgo");
const imageminMozjpeg = require('imagemin-mozjpeg');
const { WebpackManifestPlugin } = require('webpack-manifest-plugin');
// const InlineManifestWebpackPlugin  = require('inline-manifest-webpack-plugin');


const {
  CleanWebpackPlugin
} = require('clean-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');

const config = require('./config');
const {
  normalizeText
} = require('./utils/normalize');

const webpackConfig = {
  context: path.resolve(__dirname),
  entry: {
    vendor : './src/js/vendor/index.js',
    main: './src/js/global.js',
    home: './src/views/templates/home/home.js'
  },
  output: {
    chunkFilename: 'js/[name].js',
    path: path.resolve(__dirname, 'dist'),
    filename: 'js/[name].js',
    publicPath: "/",

  },
  optimization: {
    minimizer: [new OptimizeCSSAssetsPlugin({}),
      // new ImageMinimizerPlugin({
      //   minimizerOptions: {
      //     // Lossless optimization with custom option
      //     // Feel free to experiment with options for better result for you
      //     plugins: [
      //       ['gifsicle', {
      //         interlaced: true
      //       }],
      //       ['jpegtran', {
      //         progressive: true
      //       }],
      //       ['optipng', {
      //         optimizationLevel: 5
      //       }],
      //       [
      //         'svgo',
      //         {
      //           plugins: [{
      //             removeViewBox: false,
      //           }, ],
      //         },
      //       ],
      //     ],
      //   },
      // }),
    ],
    // splitChunks: {
    //   chunks: 'async',
    // },
    splitChunks: {
      chunks: 'all',
      minSize: 20000,
      // name: false,
      // minRemainingSize: 0
      maxSize: 50000,
      minChunks: 1,
      maxAsyncRequests: 30,
      maxInitialRequests: 30,
      enforceSizeThreshold: 50000,
      cacheGroups: {
        defaultVendors: {
          name: "defaultVendors",
          test: /[\\/]node_modules[\\/]/,
          chunks: "all",
          priority: -30,
          reuseExistingChunk: true,
        },
        default:
           {
          minChunks: 1,
          priority: -20,
          reuseExistingChunk: true,
        }
        ,
      },
    },
    runtimeChunk: 'single'
  },
  module: {
    rules: [{
        test: /\.html$/,
        use: [{
          loader: 'html-loader',
          options: {}
        }]
      },
      {
        test: /\.(handlebars|hbs)$/,
        loader: 'handlebars-loader',
        query: {
          partialDirs: [
            path.join(__dirname, 'src'),
            path.join(__dirname, 'src', 'views'),
            path.join(__dirname, 'src', 'views', 'layouts'),
            path.join(__dirname, 'src', 'views', 'templates'),
            path.join(__dirname, 'src', 'views', 'partials')
          ].concat(
            glob.sync('**/', {
              cwd: path.resolve(__dirname, 'src', 'views', 'partials'),
              realpath: true
            })
          )
        }
      },
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: [{
          loader: 'babel-loader'
        }]
      },
      {
        test: /\.(png|jpg|gif|obj)$/,
        loaders: [{
            loader: 'file-loader',
            options: {
              context: 'img/',
              outputPath: 'img/',
            },
          },
          {
            loader: 'img-loader',
            options: {
              plugins: [
                imageminGifsicle({
                  interlaced: false
                }),
                imageminMozjpeg({
                  progressive: true,
                  arithmetic: false
                }),
                imageminPngquant({
                  floyd: 0.5,
                  speed: 2
                }),
                imageminSvgo({
                  plugins: [{
                      removeTitle: true
                    },
                    {
                      convertPathData: false
                    }
                  ]
                })
              ]
            }
          }

        ],

      },
      {
        test: /\.(scss|sass|css)$/,
        use: [
          'style-loader',
          {
            loader: MiniCssExtractPlugin.loader,
            options: {
              // publicPath: './scss',
              hmr: process.env.NODE_ENV === 'development'
            }
          },
          'css-loader',
          'sass-loader'
        ]

      },
      {
        test: /\.(woff(2)?|ttf|eot)(\?v=\d+\.\d+\.\d+)?$/,
        use: [{
          loader: 'file-loader',
          options: {
            publicPath: '../fonts',
            context: 'fonts/',
            name: '[name].[ext]',
            outputPath: 'fonts/'
          }
        }]
      },
      {
        test: /\.(svg)(\?v=\d+\.\d+\.\d+)?$/,
        use: [{
          loader: 'file-loader',
          options: {
            publicPath: '../img',
            context: 'fonts/',
            name: '[name].[ext]',
            outputPath: 'img/'
          }
        }]
      }
    ]
  },
  plugins: [
    new WebpackManifestPlugin(),
    // new InlineManifestWebpackPlugin(),
    new CleanWebpackPlugin(),
    new MiniCssExtractPlugin({
      filename: 'css/[name].css',
      chunkFilename: '[id].css'
    }),
    new CopyPlugin([{
      from: './src/static'
    }]),
    new Webpack.ProvidePlugin({
      $: 'jquery',
      jQuery: 'jquery',
      'window.jQuery': 'jquery',
      Popper: ['popper.js', 'default'],
    })
  ],
  devServer: {
    contentBase: path.join(__dirname, 'dist')
  }
};

fs.readdirSync(path.join(__dirname, 'src', 'views', 'templates')).forEach(page => {
  console.log(`Building page: ${page.toUpperCase()}`);

  const htmlPageInit = new HtmlWebPackPlugin({
    title: `${normalizeText(page)} | Splyt`,
    template: `./src/views/templates/${page}/${page}.hbs`,
    filename: `./${page != "home" ? page + "/" : ""}index.html`,
    // chunks: ['main', "vendor", "vendors", page]
    // ,
    // chunks: "async",
    
    minify: {
      removeComments: true,
      collapseWhitespace: true,
      removeRedundantAttributes: true,
      useShortDoctype: true,
      removeEmptyAttributes: true,
      removeStyleLinkTypeAttributes: true,
      keepClosingSlash: true,
      minifyJS: true,
      minifyCSS: true,
      minifyURLs: true
    },
    inject: true,
  });

  webpackConfig.entry[page] = `./src/views/templates/${page}/${page}.js`;
  webpackConfig.plugins.push(htmlPageInit);

});

module.exports = webpackConfig;