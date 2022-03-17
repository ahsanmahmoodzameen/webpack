// The path to the CesiumJS source code
const cesiumSource = "node_modules/cesium/Source";
const cesiumWorkers = "../Build/Cesium/Workers";
const CopyWebpackPlugin = require("copy-webpack-plugin");
const path = require("path");
const webpack = require("webpack");
const HtmlWebpackPlugin = require("html-webpack-plugin");
//const UglifyJsPlugin = require("uglifyjs");
const Chunkswebpackplugin = require("chunks-webpack-plugin");
const BundleAnalyzerPlugin =
  require("webpack-bundle-analyzer").BundleAnalyzerPlugin;
const optimization = require("chunks-webpack-plugin");
const CompressionPlugin = require("compression-webpack-plugin");
const zopfli = require("@gfx/zopfli");
const zlib = require("zlib");
const TerserPlugin = require("terser-webpack-plugin");

module.exports = {
  context: __dirname,
  entry: {
    app: "./src/index.js",
  },
  output: {
    //filename: "app.js",
    filename: "[name].js",
    path: path.resolve(__dirname, "dist"),
    sourcePrefix: "",
    //no chunk filename
    chunkFilename: "[id].[chunkhash].js",
  },
  performance: {
    hints: false,
    maxEntrypointSize: 512000,
    maxAssetSize: 512000,
  },
  /*optimization: {
    splitChunks: {
      chunks: "async",
      minSize: 20000,
      minRemainingSize: 0,
      minChunks: 1,
      maxAsyncRequests: 30,
      maxInitialRequests: 30,
      enforceSizeThreshold: 50000,
      cacheGroups: {
        defaultVendors: {
          test: /[\\/]node_modules[\\/]/,
          priority: -10,
          reuseExistingChunk: true,
        },
        default: {
          minChunks: 2,
          priority: -20,
          reuseExistingChunk: true,
        },
      },
    },
    /*splitChunks: {
      cacheGroups: {
        vendor: {
          name: "node_vendors",
          test: /[\\/]node_modules[\\/]/,
          chunks: "all",
        },
      },
    },
    minimize: true,
  },*/
  optimization: {
    splitChunks: {
      cacheGroups: {
        vendors: {
          name: `chunk-vendors`,
          test: /[\\/]node_modules[\\/]/,
          priority: -10,
          chunks: "initial",
        },
        commons: {
          name: "Cesium",
          test: /[\\/]node_modules[\\/]cesium/,
          chunks: "all",
        },
      },
    },
    minimize: true,
    minimizer: [
      new TerserPlugin({
        exclude: /\/excludes/,
      }),
    ],
    //also working file below splitchunks code
    /* splitChunks: {
      cacheGroups: {
        vendor: {
          name: "node_vendors", // part of the bundle name and
          // can be used in chunks array of HtmlWebpackPlugin
          test: /[\\/]node_modules[\\/]/,
          chunks: "all",
        },
        common: {
          test: /[\\/]src[\\/]components[\\/]/,
          chunks: "all",
          minSize: 0,
        },
      },
    },*/
  },
  /*
  optimization: {
    splitChunks: {
      chunks: "all",
    },
  },
  optimization: {
    runtimeChunk: "single",
  },*/
  devServer: {
    static: {
      directory: path.resolve(__dirname, "dist"),
    },
    port: 8081,
    host: "172.16.126.66",
    compress: true,
    //disableHostCheck: true,
    // index: index.html,
  },
  amd: {
    // Enable webpack-friendly use of require in Cesium
    toUrlUndefined: true,
  },
  resolve: {
    alias: {
      cesium: path.resolve(__dirname, cesiumSource),
    },
    mainFiles: ["index", "Cesium"],
  },
  module: {
    rules: [
      {
        test: /\.css$/,
        use: ["style-loader", "css-loader"],
        /* use: [
          "style-loader",
          {
            loader: "css-loader",
            options: {
              // minify loaded css
              minimize: true,
            },
          },
        ],*/
      },
      {
        test: /\.(png|gif|jpg|jpeg|svg|xml|json)$/,
        use: ["url-loader"],
      },
      {
        type: "javascript/auto",
        test: /\.(json)/,
        exclude: /(node_modules|bower_components)/,
        use: [{ loader: "file-loader", options: { name: "[name].[ext]" } }],
      },
      {
        // Strip cesium pragmas
        test: /\.js$/,
        enforce: "pre",
        include: path.resolve(__dirname, cesiumSource),
        use: [
          {
            loader: "strip-pragma-loader",
            options: {
              pragmas: {
                debug: false,
              },
            },
          },
        ],
      },
    ],
  },
  plugins: [
    //new UglifyJsPlugin(),

    new BundleAnalyzerPlugin(),
    new TerserPlugin({
      terserOptions: {
        format: {
          comments: false,
        },
      },
      extractComments: false,
      // enable parallel running
      parallel: true,
    }),
    // new CompressionPlugin(),
    /* new CompressionPlugin({
      filename: "[path][base].gz",
      algorithm: "gzip",
      test: /\.js$|\.css$|\.html$/,
      threshold: 10240,
      minRatio: 0.8,
    }),*/
    /*new CompressionPlugin({
      compressionOptions: {
        numiterations: 15,
      },
      algorithm(input, compressionOptions, callback) {
        return zopfli.gzip(input, compressionOptions, callback);
      },
    }),*/
    new CompressionPlugin({
      filename: "[path][base].gz",
      algorithm: "gzip",
      test: /\.js$|\.css$|\.html$/,
      threshold: 10240,
      minRatio: 0.8,
    }),
    new CompressionPlugin({
      filename: "[path][base].br",
      algorithm: "brotliCompress",
      test: /\.(js|css|html|svg)$/,
      compressionOptions: {
        params: {
          [zlib.constants.BROTLI_PARAM_QUALITY]: 11,
        },
      },
      threshold: 10240,
      minRatio: 0.8,
    }),
    new HtmlWebpackPlugin({
      template: "src/index.html",
      minify: {
        collapseWhitespace: true,
        removeComments: true,
        removeRedundantAttributes: true,
        removeScriptTypeAttributes: true,
        removeStyleLinkTypeAttributes: true,
        useShortDoctype: true,
      },
    }),
    // Copy Cesium Assets, Widgets, and Workers to a static directory
    new CopyWebpackPlugin({
      patterns: [
        { from: path.join(cesiumSource, cesiumWorkers), to: "Workers" },
        { from: path.join(cesiumSource, "Assets"), to: "Assets" },
        { from: path.join(cesiumSource, "Widgets"), to: "Widgets" },
      ],
    }),
    new webpack.DefinePlugin({
      // Define relative base path in cesium for loading assets
      CESIUM_BASE_URL: JSON.stringify(""),
    }),

    new Chunkswebpackplugin({
      name: "cesium",
      minChunks: (module) =>
        module.context && module.context.indexOf("cesium") !== -1,
    }),

    /* new webpack.optimize.CommonsChunkPlugin({
      name: "cesium",
      minChunks: (module) =>
        module.context && module.context.indexOf("cesium") !== -1,
    }),*/
  ],
  /*
  optimization: {
    splitChunks: {
      chunks: "initial", // 必须三选一： "initial" | "all"(默认就是all) | "async"
      minChunks: 1, // 最小 chunk ，默认1
      name: "cesium", // 名称，此选项课接收 function,
      filename: "cesium.index.js",
    },
  },*/
  //mode should be production or development
  // mode: "production",
  //devtool: "source-map",

  devtool: false,
  //  devtool: "hidden-source-map",
  //devtool: "eval",

  // devtool: "inline-source-map",
  // for development default values
  mode: "development",
  //devtool: "eval",
};
