const {WebpackPluginServe} = require("webpack-plugin-serve");
const {MiniHtmlWebpackPlugin} = require("mini-html-webpack-plugin");
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const PurgeCSSPlugin = require('purgecss-webpack-plugin')
const CssMinimizerPlugin = require("css-minimizer-webpack-plugin");
const TerserPlugin = require("terser-webpack-plugin");
const path = require('path')
const glob = require('glob')
const HtmlWebpackPlugin = require("html-webpack-plugin");

const ALL_FILES = glob.sync(path.join(__dirname, "src/*.js"));
const APP_SOURCE = path.join(__dirname, "src");

exports.eliminateUnusedCSS = () => ({
    plugins: [
        new PurgeCSSPlugin({
            paths: ALL_FILES, // Consider extracting as a parameter
            extractors: [
                {
                    extractor: (content) =>
                        content.match(/[^<>"'`\s]*[^<>"'`\s:]/g) || [],
                    extensions: ["html"],
                },
            ],
        }),
    ],
});

exports.devServer = () => ({
    watch: true,
    plugins: [
        new WebpackPluginServe({
            port: process.env.PORT || 8080,
            static: "./dist", // Expose if output.path changes
            liveReload: true,
            waitForBuild: true,
        }),
    ],
});

exports.page = ({ title }) => ({
    plugins: [new HtmlWebpackPlugin({ title: title, template:'./src/index.html'})],
});

exports.loadCSS = () =>({
    module:{
        rules:[
            { test: /\.css$/, use: ["style-loader", "css-loader"] },
        ]
    }
});

exports.extractCSS = ({ options = {}, loaders = [] } = {}) => {
    return {
        module: {
            rules: [
                {
                    test: /\.css$/,
                    use: [
                        { loader: MiniCssExtractPlugin.loader, options },
                        "css-loader",
                    ].concat(loaders),
                    sideEffects: true,
                },
            ],
        },
        plugins: [
            new MiniCssExtractPlugin({
                filename: "[name].css",
            }),
        ],
    };
};

exports.autoprefix = () => ({
    loader: "postcss-loader",
    options: {
        postcssOptions: { plugins: [require("autoprefixer")()] },
    },
});

exports.loadImages = ({ limit } = {}) => ({
    module: {
        rules: [
            {
                test: /\.(png|jpg)$/,
                type: "asset",
                parser: { dataUrlCondition: { maxSize: limit } },
            },
        ],
    },
});


exports.loadJavaScript = () => ({
    module: {
        rules: [
            // Consider extracting include as a parameter
            { test: /\.js$/, include: APP_SOURCE, use: "babel-loader" },
        ],
    },
});
exports.clean = () =>({
    output:{
        clean:true
    }
})

exports.minifyCSS = ({ options }) => ({
    optimization: {
        minimizer: [
            new CssMinimizerPlugin({ minimizerOptions: options }),
        ],
    },
});

exports.minifyJavaScript = () => ({
    optimization: { minimizer: [new TerserPlugin()] },
});