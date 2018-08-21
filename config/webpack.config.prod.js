const webpack = require('webpack')
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const paths = require('./paths');
const GitRevisionPlugin = require('git-revision-webpack-plugin')
const gitRevisionPlugin = new GitRevisionPlugin()
const moment = require('moment');
const ManifestPlugin = require('webpack-manifest-plugin');

const publicPath = paths.servedPath;
const getClientEnvironment = require('./env');
const publicUrl = publicPath.slice(0, -1);
const env = getClientEnvironment(publicUrl);
const config = require('./configure')[process.env.SERVER_ENV || "production"]
const extractCSS = new ExtractTextPlugin('css/vendor.[chunkhash:8].css');
const extractSCSS = new ExtractTextPlugin('css/[name].[chunkhash:8].css');

module.exports = {
  entry: ['babel-polyfill', paths.appIndexJs],
  output: {
    path: paths.appBuild,
    filename: 'js/[name].[chunkhash:8].js',
    chunkFilename: 'js/[name].[chunkhash:8].chunk.js',
    // We inferred the "public path" (such as / or /my-project) from homepage.
    publicPath: publicPath,
  },
  devtool: 'source-map',
  resolve: {
    modules: ['node_modules'],
    extensions: ['.js', '.jsx', '.json', '.scss'],
  },
  module: {
    rules: [
      {
        test: [/\.js$/, /\.jsx$/],
        include: paths.appSrc,
        use: [{
          loader: 'babel-loader',
          options: {
            cacheDirectory: true,
            plugins: ['transform-decorators-legacy'],
            presets: ['env', 'stage-0', 'react'],
            compact: true,
          }
        }]
      },
      {
        test: /\.css$/,
        include: paths.appNodeModules,
        use: extractCSS.extract({
          fallback: 'style-loader',
          use: ['css-loader']
        })
      },
      {
        test: /\.scss$/,
        include: paths.appStyles,
        use: extractSCSS.extract({
          fallback: 'style-loader',
          use: [{
            loader: 'css-loader',
            options: {
              import: true,
              importLoaders: 1,
              alias: {
                'variables': path.resolve(paths.appStyles, '/variables.scss'),
              },
            }
          }, {
            loader: 'sass-loader',
          }]
        })
      },
      {
        test: /\.scss$/,
        include: path.resolve(paths.appSrc, 'component'),
        use: extractSCSS.extract({
          fallback: 'style-loader',
          use: [{
            loader: 'css-loader',
            options: {
              importLoaders: 1,
              // minimize: true,
              modules: true,
              import: true,
              localIdentName: "[name]__[local]--[hash:base64:5]",
            }
          }, {
            loader: 'sass-loader',
          }]
        })
      },
      {
        test: [/\.bmp$/, /\.gif$/, /\.jpe?g$/, /\.png$/],
        loader: require.resolve('url-loader'),
        options: {
          limit: 10000,
          name: 'media/[name].[hash:8].[ext]',
        },
      },
      {
        test: /.(ttf|otf|eot|svg|woff(2)?)(\?[a-z0-9]+)?$/,
        use: [{
          loader: 'file-loader',
          options: {
            name: '[name].[ext]',
            outputPath: 'fonts/',    // where the fonts will go
          }
        }]
      },
      {
        test: [/\.xlsx?$/, /\.csv$/],
        loader: require.resolve('url-loader'),
        options: {
          limit: 10000,
          name: 'attachment/[name].[ext]',
        },
      }
    ]
  },
  plugins: [
    new HtmlWebpackPlugin({
      inject: true,
      template: paths.appHtml,
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
        minifyURLs: true,
      },
    }),
    new webpack.optimize.CommonsChunkPlugin({
      name: 'vendor',
      minChunks: module => module.context && module.context.indexOf('node_modules') !== -1
    }),
    extractCSS,
    extractSCSS,
    new webpack.DefinePlugin(env.stringified),
    new webpack.DefinePlugin({
      'COMMITHASH': JSON.stringify(gitRevisionPlugin.commithash().slice(0, 8)),
      'BRANCHNAME': JSON.stringify(gitRevisionPlugin.branch()),
      'BUILDTIME': JSON.stringify(moment().format('YYYY-MM-DD HH:mm:ss')),
      'EDI_CLIENT': JSON.stringify(JSON.stringify(config.clientVariable))
    }),
    new webpack.optimize.UglifyJsPlugin({
      beautify: false,
      comments: false,
      sourceMap: process.env.SOURCEMAP === 'true',
      compress: {
        warnings: false,
        collapse_vars: true,
        reduce_vars: true,
        comparisons: false,
      },
      output: {
        comments: false,
        ascii_only: true,
      }
    }),
    new ManifestPlugin({
      fileName: 'asset-manifest.json',
    }),
  ],
}
