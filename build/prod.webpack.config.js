const merge  = require('webpack-merge');
const path = require('path');
const { EnvironmentPlugin } = require('webpack');
const { commonConfig } = require('./common.webpack.config');
const TerserPlugin = require('terser-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
module.exports = merge(commonConfig, {
	mode: 'development',
	devtool: 'source-map',
	output: {
		filename: '[name].js'
	},
	optimization: {
		minimize: true,
		minimizer: [new TerserPlugin()]
	},
	plugins: [
		new EnvironmentPlugin({
			'process.env.NODE_ENV': 'development'
		}),
		new CleanWebpackPlugin()
	]
});
