// webpack.config.js
const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  entry: './src/index.js', // Your entry file
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist'), // Output directory
    publicPath: '/', // Ensure correct public path for static assets
  },
  resolve: {
    fallback: {
      "crypto": require.resolve("crypto-browserify"),
      "stream": require.resolve("stream-browserify"),
      "buffer": require.resolve("buffer"),
      "assert": require.resolve("assert"),
      "process": require.resolve("process/browser"), // Added polyfill for process
      "vm": require.resolve("vm-browserify"), // Add this line
      "http": require.resolve("stream-http"),
      "https": require.resolve("https-browserify"),
      "zlib": require.resolve("browserify-zlib"),
      "url": require.resolve("url/")

    }
  },
  plugins: [
    new webpack.ProvidePlugin({
      Buffer: ['buffer', 'Buffer'],
      process: 'process/browser',
    }),
   
      new HtmlWebpackPlugin({
        template: 'public/index.html',
        inject: true,
        publicPath: '/', // Ensure this matches your intended public path
      }),
    new webpack.DefinePlugin({
      'process.env.REACT_APPPUBLIC_URL': JSON.stringify(''), // Set to '' or your actual public URL
    }),
    new webpack.EnvironmentPlugin({
      REACT_APP_PUBLIC_URL: '', // Default public URL for development
    }),
  ],
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env', '@babel/preset-react'],
            // plugins: ['@babel/plugin-transform-runtime'] // Uncomment if using async/await
          },
        },
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      },
      // Add loaders for other file types if needed, e.g., images, fonts
      {
        test: /\.(png|jpe?g|gif)$/i,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env', '@babel/preset-react'],
          },
        },
      },
      {
        test: /\.(png|jpe?g|gif)$/i,
        use: [
          {
            loader: 'file-loader',
          },
        ],
      }
      
    ],
  },
  devServer: {
    static: {
      directory: path.resolve(__dirname, 'public'), // Updated option for serving static files
    },
    compress: true,
    port: 9000, // Specify a port for your server
    historyApiFallback: true, // Ensure SPA routing works correctly
  },
  mode: 'development', // Set to 'development' or 'production' as needed
};
