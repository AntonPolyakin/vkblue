const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const path = require('path');
const configs = require('./webpack.config');

configs.forEach(config => {
    config.mode = 'production';
    config.output.path = path.resolve(`./build/${process.env.BROWSER}/prod`);
    config.plugins.push(
        new CleanWebpackPlugin()
    );
});

module.exports = configs;
