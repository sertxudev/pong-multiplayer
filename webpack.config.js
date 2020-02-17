const VueLoaderPlugin = require('vue-loader/lib/plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const MiniCssExtractPlugin = require("mini-css-extract-plugin")
const CopyWebpackPlugin = require('copy-webpack-plugin')

const path = require('path')

const modules = {
  rules: [
    {
      test: /\.vue$/,
      use: {
        loader: 'vue-loader',
        options: {
          extractCSS: true,
          loaders: {
            sass: 'vue-style-loader!css-loader!sass-loader?indentedSyntax=1',
            scss: 'vue-style-loader!css-loader!sass-loader',
            less: 'vue-style-loader!css-loader!less-loader'
          }
        }
      }
    },
    {
      test: /\.html$/,
      use: 'vue-html-loader'
    },
    {
      test: /\.js$/,
      use: 'babel-loader',
      exclude: [/node_modules/]
    },
    {
      test: /\.css$/,
      use: ['style-loader', 'vue-style-loader', MiniCssExtractPlugin.loader, 'css-loader']
    }
  ]
}

module.exports = {
  target: 'web',
  entry: {
    main: './src/js/main.js',
  },
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, 'dist/assets')
  },
  module: modules,
  plugins: [
    new VueLoaderPlugin(),
    new MiniCssExtractPlugin({ filename: '[name].css' }),
    new HtmlWebpackPlugin({
      inject: true,
      template: "./src/html/index.html",
      filename: __dirname + "/dist/main.html",
      minify: {
        collapseWhitespace: true,
        removeAttributeQuotes: true,
        removeComments: true
      },
      nodeModules: false
    }),
    new CopyWebpackPlugin([
      {
        from: path.join(__dirname, './src/images'),
        to: path.join(__dirname, './dist/images'),
        ignore: ['.*']
      }
    ])
  ],
  resolve: {
    alias: {
      '@': path.join(__dirname, '../src'),
      'vue$': 'vue/dist/vue.esm.js'
    },
    extensions: ['.js', '.vue', '.json', '.css', '.node']
  }
}