const path = require('path');
const configs = require('./webpack.config');

configs.forEach(config => {
  config.mode = 'development';
  config.devtool = 'source-map';
  config.output.path = path.resolve(`./build/${process.env.BROWSER}/dev`);
});

module.exports = configs;
