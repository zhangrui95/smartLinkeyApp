/* eslint-disable */
const webpack = require('webpack');

module.exports = function(webpackConfig, env) {
  webpackConfig.plugins.push(new webpack.ExternalsPlugin('commonjs', ['electron']));
  return webpackConfig;
};
