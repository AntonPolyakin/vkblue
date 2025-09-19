const CleanWebpackPlugin = require('clean-webpack-plugin');

const webpack = require('webpack');
const path = require('path');
const ENV = require('./env')
const config = require('./webpack.config');

config.mode = 'production';
config.output.path = path.resolve(`./build/${process.env.BROWSER}/prod`);
config.plugins.push(
    new webpack.DefinePlugin({
        global: 'window', // Placeholder for global used in any node_modules
        'process.env': {
            NODE_ENV: JSON.stringify('production'),
            BROWSER: JSON.stringify(process.env.BROWSER),
            LAST_FM_API_KEY: JSON.stringify(ENV.LAST_FM_API_KEY)
        },
    }),
    new CleanWebpackPlugin.CleanWebpackPlugin(),
);

module.exports = config;
