const { merge } = require('webpack-merge');
const path = require('path');
const { EnvironmentPlugin } = require('webpack');
const { commonConfig } = require('./common.webpack.config');

module.exports = merge(commonConfig, {
	mode: 'development',
	watch: true,
	devtool: 'source-map',
	output: {
		filename: '[name].js'
	},
	plugins: [
		new EnvironmentPlugin({
			'process.env.NODE_ENV': 'development'
		})
	]
});
