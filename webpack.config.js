const { promisify } = require("util");
const fs = require("fs");
const path = require("path");
const chalk = require("chalk");
const CleanWebpackPlugin = require("clean-webpack-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const HTMLInlineCSSWebpackPlugin = require("html-inline-css-webpack-plugin")
  .default;
const HtmlWebpackExcludeAssetsPlugin = require("html-webpack-exclude-assets-plugin");
const FaviconsWebpackPlugin = require("favicons-webpack-plugin");
const CompressionPlugin = require("compression-webpack-plugin");
const { GenerateSW } = require("workbox-webpack-plugin");
const PRODUCTION_ENV = "production";
const DEVELOPMENT_ENV = "development";
const { NODE_ENV = PRODUCTION_ENV } = process.env;
const isProduction = NODE_ENV === PRODUCTION_ENV;
const dirDist = path.resolve(__dirname, "dist");
const dirSrc = path.resolve(__dirname, "src");
const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);
const divider = chalk.black.bold("\n - - - - - - - - - - - - - - - -");

console.log(
  divider,
  `${chalk.green.bold("\n[node environment]")} ${NODE_ENV}`,
  `${chalk.green.bold("\n[source directory]")} ${dirSrc}`,
  `${chalk.green.bold("\n[dist directory]")} ${dirDist}`,
  divider
);

const EnrichAppManifest = function() {};

EnrichAppManifest.prototype.apply = compiler =>
  compiler.plugin("done", () =>
    setTimeout(async () => {
      const dirManifest = `${dirDist}/manifest.json`;
      const response = await readFile(dirManifest);
      const manifestJson = {
        ...JSON.parse(response.toString()),
        short_name: "Devon",
        name: "Devon Church",
        description:
          "A portal for Devon Church, a developer in New Zealand working at Xero",
        theme_color: "#0074e5",
        background_color: "#fff",
        display: "fullscreen",
        start_url: "/",
        scope: "/"
      };
      const manifestString = JSON.stringify(manifestJson, null, 2);
      await writeFile(dirManifest, manifestString);

      console.log(
        `${chalk.green.bold("\n[complete]")} enriched manifest`,
        divider,
        chalk.gray(manifestString),
        divider
      );

      return;
    }, 2000)
  );

const config = {
  mode: isProduction ? PRODUCTION_ENV : DEVELOPMENT_ENV,

  entry: dirSrc,

  output: {
    path: dirDist
  },

  devtool: isProduction ? "source-map" : "cheap-source-map",

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
      },
      {
        test: /\.ttf$/,
        use: [
          {
            loader: "file-loader",
            options: {
              name: "[name].[ext]"
            }
          }
        ]
      }
    ]
  },

  plugins: (() => {
    const cleanMe = new CleanWebpackPlugin(dirDist);
    const excludeAssets = new HtmlWebpackExcludeAssetsPlugin();
    const extractCSS = new MiniCssExtractPlugin({ filename: "app.css" });
    const enrichManifest = new EnrichAppManifest();

    const compression = new CompressionPlugin({
      asset: "[path][query]",
      // exclude: [/manifest.json/, /^precache/, /^service-worker/]
      exclude: /manifest.json/
    });

    const favicon = new FaviconsWebpackPlugin({
      logo: `${dirSrc}/favicon.png`,
      prefix: "/",
      statsFilename: "iconstats.json",
      persistentCache: true,
      inject: true,
      title: "Devon Church"
    });

    const indexPage = new HtmlWebpackPlugin({
      template: "src/index.hbs",
      minify: isProduction,
      excludeAssets: /main.*.js/,
      inlineSource: /\.css$/
    });

    const errorPage = new HtmlWebpackPlugin({
      filename: "error/index.html",
      template: "src/error.hbs",
      minify: isProduction,
      excludeAssets: /main.*.js/,
      inlineSource: /\.css$/
    });

    const _404Page = new HtmlWebpackPlugin({
      filename: "404/index.html",
      template: "src/404.hbs",
      minify: isProduction,
      excludeAssets: /main.*.js/,
      inlineSource: /\.css$/
    });

    const serviceWorker = new GenerateSW({
      include: [/\.html$/, /^manifest/, /^favicon/],
      clientsClaim: true,
      skipWaiting: true,
      runtimeCaching: [
        {
          urlPattern: /\.png$/,
          handler: "cacheFirst",
          options: {
            cacheName: "images",
            expiration: {
              maxEntries: 50,
              maxAgeSeconds: 60 * 60 * 24
            }
          }
        },
        {
          urlPattern: /\.ttf$/,
          handler: "cacheFirst",
          options: {
            cacheName: "fonts",
            expiration: {
              maxEntries: 10,
              maxAgeSeconds: 60 * 60 * 24
            }
          }
        }
      ]
    });
    const inline = new HTMLInlineCSSWebpackPlugin();

    return isProduction
      ? [
          cleanMe,
          indexPage,
          errorPage,
          _404Page,
          excludeAssets,
          extractCSS,
          inline,
          favicon,
          enrichManifest,
          serviceWorker,
          compression
        ]
      : [indexPage, errorPage, excludeAssets, extractCSS, inline];
  })()
};

module.exports = config;
