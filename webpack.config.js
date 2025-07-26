
// webpack.config.js
const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const Dotenv = require('dotenv-webpack'); // Keep this line

module.exports = {
  // Set mode to 'development' or 'production'
  mode: 'development', // For hackathon, 'development' is fine. Use 'production' for final build.
  // Entry points for your different extension parts
  entry: {
    background: './background.js',
    content: './content.js',
    popup: './popup.js',
    // You can add more entry points for options page, etc.
  },
  output: {
    path: path.resolve(__dirname, 'dist'), // All bundled files go into a 'dist' folder
    filename: '[name].bundle.js', // Output files like background.bundle.js, content.bundle.js
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env'],
          },
        },
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      },
    ],
  },
  plugins: [
    // Copy manifest.json and icons to the dist folder
    new CopyPlugin({
      patterns: [
        { from: 'manifest.json', to: 'manifest.json' },
        { from: 'icons', to: 'icons' }, // Assuming your icons are in an 'icons' folder
        // If sentiment-analyzer.js is still a standalone file not imported directly, copy it
        { from: 'sentiment-analyzer.js', to: 'sentiment-analyzer.js' },
        // If you still want a local rewrite-data.js fallback, copy it too
        // { from: 'rewrite-data-local-fallback.js', to: 'rewrite-data-local-fallback.js' },
      ],
    }),
    // Generate popup.html from your source popup.html
    new HtmlWebpackPlugin({
      template: './popup.html',
      filename: 'popup.html',
      chunks: ['popup'], // This ensures only popup.bundle.js is injected into popup.html
    }),
    // Add Dotenv plugin here to load environment variables from .env file
    new Dotenv(),
  ],
  devtool: 'cheap-module-source-map', // Easier debugging in development
  // IMPORTANT for Manifest V3 service worker (background.js)
  // Ensure the service worker bundle is treated as a module
  experiments: {
    outputModule: true,
  },
};
