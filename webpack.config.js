const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

const envPath = path.resolve(__dirname, '.env');
const envLocalPath = path.resolve(__dirname, '.env.local');
const dotenvFiles = [envPath, envLocalPath].filter(f => fs.existsSync(f));

dotenvFiles.forEach(f => {
    dotenv.config({ path: f, override: true });
});

const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const WrapperPlugin = require('wrapper-webpack-plugin');
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');
const manifest = require('./manifest');
const webpack = require('webpack');
const Dotenv = require('dotenv-webpack');

const isMV3 = process.env.MANIFEST_VERSION === '3';

const commonConfig = {
    module: {
        rules: [
            { test: /\.tsx?$/, use: { loader: 'ts-loader', options: { transpileOnly: true } }, exclude: /node_modules/ },
            { test: /.js?$/, exclude: /node_modules/, use: { loader: 'babel-loader' } },
            { test: /\.css$/, exclude: /node_modules/, use: [MiniCssExtractPlugin.loader, 'css-loader', 'resolve-url-loader'] },
            {
                test: /\.scss$/,
                exclude: /node_modules/,
                use: [
                    MiniCssExtractPlugin.loader,
                    { loader: 'css-loader', options: { modules: { localIdentName: '[hash:base64:10]' }, sourceMap: true } },
                    'resolve-url-loader',
                    { loader: 'sass-loader', options: { sourceMap: true } },
                ],
            },
            { test: /\.woff2?$|\.ttf$|\.eot$|\.svg$|\.jpe?g/, use: 'file-loader', exclude: /sources/ },
            { test: /\.gif|\.png|\.webp$/, use: [{ loader: 'url-loader', options: { limit: 20000 } }] },
        ],
    },
    resolve: {
        extensions: ['.tsx', '.ts', '.js', '.json'],
        fallback: {
            "net": false, "tls": false, "fs": false,
            "url": require.resolve('url'),
            "crypto": require.resolve('crypto-browserify'),
            "stream": require.resolve('stream-browserify'),
            "http": require.resolve('stream-http'),
            "https": require.resolve('https-browserify'),
            "zlib": require.resolve('browserify-zlib'),
            "path": require.resolve('path-browserify'),
            "querystring": require.resolve("querystring-es3"),
            "process": require.resolve("process/browser"),
            "buffer": require.resolve("buffer/")
        },
    },
    stats: 'errors-only',
    node: { global: false },
    plugins: [
        new Dotenv({
            path: dotenvFiles[0],
            safe: false,
            systemvars: true,
            defaults: dotenvFiles[1] ? dotenvFiles[1] : undefined,
        }),
        // new WrapperPlugin({
        //     test: /page\.js$/,
        //     header: isMV3
        //         ? '' 
        //         : 'var vkBluePageScript = function () {',
        //     footer: isMV3
        //         ? '' 
        //         : `
        //         };
        //         var script = document.createElement('script');
        //         script.textContent = '(' + vkBluePageScript.toString() + ')();';
        //         script.type = 'text/javascript';
        //         window.document.documentElement.appendChild(script);
        //         script.remove();
        //  `,
        // }),
        new MiniCssExtractPlugin({ filename: '[name].css' }),
        new CopyWebpackPlugin([
            {
                from: './manifest.js',
                to: './manifest.json',
                transform() { return JSON.stringify(manifest); },
            },
            { from: './source/config/_locales', to: '_locales/' },
            { from: './source/config/icons' },
            { from: './sounds', to: 'sounds/' },
            {
                from: './source/modules/equalizer/assets/js/SignalsmithStretch.min.js',
                to: './SignalsmithStretch.min.js',
            },
            {   
                from: './source/content/fetch/search_album_redirect_injection.js',
                to: './search_album_redirect_injection.js',
            }
        ]),
        new ForkTsCheckerWebpackPlugin(),
        new webpack.ProvidePlugin({
            global: 'globalThis',
            process: 'process/browser',
            Buffer: ['buffer', 'Buffer']
        }),
    ],
};

const webEntry = {
    content: ['./source/content/index.js'],
    page: ['./source/contexts/page/index.js'],
    inject: ['./source/contexts/page/inject.js'],
};

const backgroundEntry = {
    background: ['./source/contexts/background/index.js'],
};

if (isMV3) {
    backgroundEntry.serviceWorker = ['./source/contexts/background/serviceWorker.js'];
}

const webConfig = {
    ...commonConfig,
    name: 'webConfig',
    target: 'web',
    entry: webEntry,
    output: {
        filename: '[name].js',
        path: __dirname + '/dist',
        publicPath:
            process.env.BROWSER === 'firefox'
                ? 'moz-extension://__MSG_@@extension_id__/'
                : 'chrome-extension://__MSG_@@extension_id__/',
    },
};

const backgroundConfig = {
    ...commonConfig,
    name: 'backgroundConfig',
    target: isMV3 ? 'webworker' : 'web',
    entry: backgroundEntry,
    output: {
        filename: '[name].js',
        path: __dirname + '/dist',
        publicPath:
            process.env.BROWSER === 'firefox'
                ? 'moz-extension://__MSG_@@extension_id__/'
                : 'chrome-extension://__MSG_@@extension_id__/',
        globalObject: isMV3 ? 'self' : undefined,
        chunkLoading: false,
    },
    optimization: {
        splitChunks: false,
        runtimeChunk: false,
    },
};

module.exports = [webConfig, backgroundConfig];
