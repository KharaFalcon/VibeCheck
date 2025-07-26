// webpack.config.js
const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const Dotenv = require('dotenv-webpack');

module.exports = {
  // Set mode to 'development' or 'production'
  mode: 'development', // For hackathon, 'development' is fine. Use 'production' for final build.
  entry: {
    background: './src/background.js',
    content: './src/content.js',
    popup: './src/popup.js',

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
    // Copy manifest.json (assuming it stays in the root)
    new CopyPlugin({
      patterns: [
        { from: 'manifest.json', to: 'manifest.json' },
        // If you want to include icons and sentiment-analyzer.js,
        // make sure they are in src/ and uncomment these lines:
        // { from: 'src/icons', to: 'icons' },
        // { from: 'src/sentiment-analyzer.js', to: 'sentiment-analyzer.js' },
        // If you still want a local rewrite-data.js fallback, copy it too
        // { from: 'src/rewrite-data-local-fallback.js', to: 'rewrite-data-local-fallback.js' },
      ],
    }),
    // Generate popup.html from your source popup.html
    new HtmlWebpackPlugin({
      template: './src/popup.html', // CORRECTED: Path to popup.html inside src/
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
