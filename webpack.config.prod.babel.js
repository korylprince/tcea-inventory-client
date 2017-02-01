import path from "path";
import webpack from "webpack";
import autoprefixer from "autoprefixer";
import OptimizeJsPlugin from "optimize-js-plugin";
import ExtractTextPlugin from "extract-text-webpack-plugin";
import HtmlWebpackPlugin from "html-webpack-plugin";
import FaviconsWebpackPlugin from "favicons-webpack-plugin";
var cssExtractPlugin = new ExtractTextPlugin("/css/inventory.css");

var root = path.resolve(__dirname);

var API_BASE = process.env.API_BASE ? process.env.API_BASE : "http://localhost/api/1.0";

module.exports = {
    entry: path.resolve(root, "src/main.js"),
    output: {
        path: path.resolve(root, "dist"),
        filename: "/js/inventory.js"
    },
    stats: {children: false},
    module: {
        loaders: [
            {
                test: /\.vue$/,
                loader: "vue"
            },
            {
                test: /\.js$/,
                loader: "babel",
                exclude: /node_modules/
            },
            {
                test: /\.css$/,
                loader: cssExtractPlugin.extract(["css", "postcss-loader"])
            },
            {
                test: /\.scss$/,
                loader: cssExtractPlugin.extract(["css", "postcss-loader", "sass"])
            },
            {
                test: /\.sass$/,
                loader: cssExtractPlugin.extract(["css", "postcss-loader", "sass"])
            },
            {
                test: /\.theme$/,
                loaders: ["raw", "sass-loader"]
            },

            {
                test: /\.(png|jpg|gif|svg)$/,
                loader: "file",
                options: {
                    name: "[name].[ext]?[hash]"
                }
            }
        ]
    },
    vue: {
        loaders: {
            css: cssExtractPlugin.extract(["css", "postcss-loader"]),
            scss: cssExtractPlugin.extract(["css", "postcss-loader", "sass"]),
            sass: cssExtractPlugin.extract(["css", "postcss-loader", "sass"])
        }
    },
    postcss: [
        autoprefixer({
            browsers: ["last 2 versions"]
        })
    ],
    resolve: {
        alias: {
            "vue$": path.resolve(root, "node_modules", "vue/dist/vue.common.js")
        },
        extensions: ["", ".js", ".vue"]
    },
    plugins: [
        new webpack.DefinePlugin({
            "process.env": {
                NODE_ENV: "'production'"
            }
        }),
        new webpack.DefinePlugin({
            API_BASE: JSON.stringify(API_BASE)
        }),
        cssExtractPlugin,
        new HtmlWebpackPlugin({
            title: "TCEA Tech Inventory",
            template: path.resolve(root, "src/index.html")
        }),
        new FaviconsWebpackPlugin({
            logo: path.resolve(root, "src/img/favicon.png"),
            prefix: "icons/",
            icons: {
                android: true,
                appleIcon: true,
                appleStartup: false,
                coast: false,
                favicons: true,
                firefox: false,
                opengraph: false,
                twitter: false,
                yandex: false,
                windows: false
            }
        }),
        new webpack.IgnorePlugin(/^\.\/locale$/, [/moment$/]),
        new webpack.optimize.DedupePlugin(),
        new webpack.optimize.UglifyJsPlugin({
            compress: {
                warnings: false
            },
            comments: false
        }),
        new webpack.optimize.OccurenceOrderPlugin(),
        new OptimizeJsPlugin({
            sourceMap: false
        })
    ]
};
