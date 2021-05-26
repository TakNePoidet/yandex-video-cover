const path = require('path');
const WebpackBar = require('webpackbar');
const ESLintPlugin = require('eslint-webpack-plugin');
const nodeExternals = require('webpack-node-externals');
exports.commonConfig = {
	entry: {
		server: './src/app-server/index.ts',
		cli: './src/cli-command/index.ts'
	},
	output: {
		publicPath: '/',
		path: path.join(__dirname, '../app')
	},
	module: {
		rules: [
			{
				test: /\.jsx?$/,
				exclude: /node_modules/,
				use: [
					{
						loader: 'babel-loader',
						options: { configFile: path.resolve(__dirname, '../.babelrc') }
					}
				]
			},
			{
				test: /\.tsx?$/,
				exclude: /node_modules/,
				use: [
					{
						loader: 'ts-loader',
						options: {
							transpileOnly: true
						}
					}
				]
			}
		]
	},
	plugins: [
		new ESLintPlugin({
			context: '../src',
			extensions: ['.js', '.ts', '.vue']
		}),
		new WebpackBar()
	],
	resolve: {
		extensions: ['.js', '.ts', '.jsx', '.tsx']
	},
	target: 'node',
	node: {
		__dirname: false,
		__filename: false
	},
	externals: [nodeExternals()]
};
