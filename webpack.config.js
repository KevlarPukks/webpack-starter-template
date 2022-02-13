const { mode } = require("webpack-nano/argv");
const { merge } = require("webpack-merge");
const parts = require("./webpack.parts");
const path = require("path");


const cssLoaders = [parts.autoprefix()]

const commonConfig = merge([
    { entry: ["./src"] },
    parts.page({ title: "Demo" }),
    parts.extractCSS({loaders:cssLoaders}),
    parts.loadImages({limit:1500}),
    parts.clean()
]);

const productionConfig = merge([
    parts.minifyJavaScript(),
    parts.eliminateUnusedCSS(),
    parts.loadJavaScript(),
    parts.minifyCSS({options:{preset:["default"]}})
]);

const developmentConfig = merge([
    { entry: ["webpack-plugin-serve/client"] },
    parts.devServer(),

]);

const getConfig = (mode) => {
    switch (mode) {
        case "production":
            return merge(commonConfig, productionConfig, { mode });
        case "development":
            return merge(commonConfig, developmentConfig, { mode });
        default:
            throw new Error(`Trying to use an unknown mode, ${mode}`);
    }
};

module.exports = getConfig(mode);