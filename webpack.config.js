const path = require('path');
const glob = require('glob');

const webpack = require('webpack'); //to access built-in plugins
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ExtractTextPlugin = require("extract-text-webpack-plugin");
const PurifyCSSPlugin = require('purifycss-webpack');

module.exports = {
    // webpack folder's entry js - excluded from jekll's build process.
    entry: {
        main: "./src/js/main.js",
        search: "./src/js/search.js"
    },

    output: {
      // we're going to put the generated file in the assets folder so jekyll will grab it.
        path: path.join(__dirname, './assets'),
        filename: "[name].js"
    },
    
    module: {
        rules: [{
            test: /\.scss$/,
            loader: ExtractTextPlugin.extract({
                fallback: "style-loader",
                use: "css-loader!sass-loader",
            }),
        }, {
            test: /\.css$/,
            loader: ExtractTextPlugin.extract({
                fallback: "style-loader",
                use: "css-loader",
            }),
        }, {
            test: /\.(eot|svg|ttf|woff|woff2)$/,
            loader: 'file-loader?name=fonts/[name].[ext]'
        }, {
            test: /\.(png|jpg|jpeg)$/,
            loader: 'file-loader?name=images/[name].[ext]'
        }]
    },
    plugins: [
        new ExtractTextPlugin({
            filename: "[name].css"
        }),
        new PurifyCSSPlugin({
            // Give paths to parse for rules. These should be absolute!
            paths: glob.sync(path.join(__dirname, '_site/**/*.html')),
        })
    ]
  };