const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const WrapperPlugin = require('wrapper-webpack-plugin');
const manifest = require('./manifest');

const config = {
    target: 'web',
    entry: {
        content: ['./source/content/index.js'],
        background: ['./source/contexts/background/index.js'],
        page: ['./source/contexts/page/index.js'],
    },
    output: {
        filename: '[name].js',
        publicPath:
            process.env.BROWSER === 'firefox'
                ? 'moz-extension://__MSG_@@extension_id__/'
                : 'chrome-extension://__MSG_@@extension_id__/',
    },
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: 'ts-loader',
                exclude: /node_modules/,
            },
            {
                test: /.js?$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader',
                },
            },
            {
                test: /\.css$/,
                exclude: /node_modules/,
                loader: [
                    MiniCssExtractPlugin.loader,
                    {
                        loader: 'css-loader',
                    },
                    {
                        loader: 'resolve-url-loader',
                    },
                ],
            },
            {
                test: /\.scss$/,
                exclude: /node_modules/,
                loader: [
                    MiniCssExtractPlugin.loader,
                    {
                        loader: 'css-loader',
                        options: {
                            modules: {
                                localIdentName: '[hash:base64:10]',
                            },
                            sourceMap: true,
                        },
                    },
                    {
                        loader: 'resolve-url-loader',
                    },
                    {
                        loader: 'sass-loader',
                        options: {
                            sourceMap: true,
                        },
                    },
                ],
            },
            {
                test: /\.woff2?$|\.ttf$|\.eot$|\.svg$|\.jpe?g/,
                use: 'file-loader',
                exclude: /sources/,
            },
            {
                test: /\.gif|\.png$/,
                use: [
                    {
                        loader: 'url-loader',
                        options: {
                            limit: 20000,
                        },
                    },
                ],
            },
        ],
    },
    resolve: {
        extensions: ['.tsx', '.ts', '.js', '.json'],
    },
    stats: 'errors-only',
    node: {
        global: false,
        net: 'empty',
        tls: 'empty',
        dns: 'empty',
        fs: 'empty',
    },
    plugins: [
        new WrapperPlugin({
            test: /page\.js$/, // only wrap output of bundle files with '.js' extension
            header: `var vkBluePageScript = function () {`,
            footer: `\n
            };
            var script = document.createElement('script');
            script.textContent = '(' + vkBluePageScript.toString() + ')();';
            script.type = 'text/javascript';

            window.document.documentElement.appendChild(script);
            script.remove();
            `,
        }),
        new MiniCssExtractPlugin({
            filename: '[name].css',
        }),
        new CopyWebpackPlugin([
            {
                from: './manifest.js',
                to: './manifest.json',
                transform() {
                    return JSON.stringify(manifest);
                },
            },
            { from: './source/config/_locales', to: '_locales/' },
            { from: './source/config/icons' },
            { from: './sounds', to: 'sounds/' },
        ]),
    ],
};

module.exports = config;
