const webpack = require('webpack');
const resolve = require('path').resolve;
const shelljs = require('shelljs');
const _ = require('lodash');

const entry = {
  G6: './src/index.js',
  G6Plugins: './plugins/index.js'
};

shelljs.ls(resolve(__dirname, 'plugins')).forEach(pluginPath => {
  if (pluginPath === 'base.js') return;
  if (pluginPath !== 'index.js') {
    const fileDirs = pluginPath.split('-');
    let moduleName = '';
    for (let i = 0; i < fileDirs.length; i++) {
      const segment = fileDirs[i];
      moduleName += (segment.charAt(0).toUpperCase() + segment.substring(1));
    }
    entry[moduleName] = `./plugins/${pluginPath}/index.js`;
  } else {
    const moduleName = 'plugins';
    entry[moduleName] = './plugins/index.js';
  }
});

module.exports = {
  mode: 'production',
  devtool: 'cheap-source-map',
  entry,
  output: {
    filename: substitutions => `${_.lowerFirst(substitutions.chunk.name)}.js`,
    library: '[name]',
    libraryTarget: 'umd',
    path: resolve(__dirname, 'build/')
  },
  externals: {
    '@exceed.ai/g6': {
      root: 'G6',
      commonjs2: '@exceed.ai/g6',
      commonjs: '@exceed.ai/g6',
      amd: '@exceed.ai/g6'
    }
  },
  module: {
    rules: [
      {
        // 用于web worker代码。注意这条规则必须在.js规则前面，
        // 这样.worker.js会经过['worker-loader', 'babel-loader']处理
        test: /\.worker\.js$/,
        exclude: /(node_modules|bower_components)/,
        use: {
          loader: 'worker-loader',
          options: {
            inline: true,
            fallback: false,
            name: 'g6Layout.worker.js'
          }
        }
      },
      {
        test: /\.js$/,
        exclude: /(node_modules|bower_components)/,
        use: {
          loader: 'babel-loader',
          options: {
            babelrc: true
          }
        }
      }
    ]
  },
  plugins: [
    new webpack.NoEmitOnErrorsPlugin(),
    new webpack.optimize.AggressiveMergingPlugin()
  ]
};
