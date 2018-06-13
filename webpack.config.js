const path = require("path");
const CleanWebpackPlugin = require("clean-webpack-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const HtmlWebpackExcludeAssetsPlugin = require("html-webpack-exclude-assets-plugin");
const PRODUCTION_ENV = "production";
const DEVELOPMENT_ENV = "development";
const { NODE_ENV = PRODUCTION_ENV } = process.env;
const isProduction = NODE_ENV === PRODUCTION_ENV;
const dirDist = path.resolve(__dirname, "dist");
const dirSrc = path.resolve(__dirname, "src");

const config = {
  mode: isProduction ? PRODUCTION_ENV : DEVELOPMENT_ENV,

  entry: dirSrc,

  output: {
    path: dirDist
  },

  // devtool: isProduction ? 'source-map' : 'cheap-source-map',

  // stats: isProduction ? 'normal' : 'errors-only',

  module: {
    rules: [
      {
        test: /\.css$/,
        use: [MiniCssExtractPlugin.loader, "css-loader"]
      },
      {
        test: /\.hbs$/,
        loader: "handlebars-loader"
      }
    ]
  },

  plugins: [
    new CleanWebpackPlugin(dirDist),

    new HtmlWebpackPlugin({
      template: "src/index.hbs",
      minify: isProduction,
      excludeAssets: [/main.*.js/]
    }),

    new HtmlWebpackPlugin({
      filename: "error/index.html",
      template: "src/error.hbs",
      minify: isProduction,
      excludeAssets: [/main.*.js/]
    }),

    new HtmlWebpackExcludeAssetsPlugin(),

    new MiniCssExtractPlugin({
      filename: "app.css"
    })
  ]
};

module.exports = config;