const CopyPlugin = require('copy-webpack-plugin');

module.exports = {
  entry: './src/js/main/main.js',
  devtool: 'source-map',
  module: {
    rules: [
      {
        test: /\.node$/,
        use: '@vercel/webpack-asset-relocator-loader',
      },
      {
        // We're specifying native_modules in the test because the asset relocator loader generates a
        // "fake" .node file which is really a cjs file.
        test: /native_modules[/\\].+\.node$/,
        use: 'node-loader',
      },
      {
        test: /[/\\]node_modules[/\\].+\.(m?js|node)$/,
        parser: { amd: false },
        use: {
          loader: '@vercel/webpack-asset-relocator-loader',
          options: {
            outputAssetBase: 'native_modules',
          },
        },
      },
      {
        test: /\.js?$/,
        exclude: /node_modules/,
        use: {
            loader: 'babel-loader',
            options: {
                presets: ['@babel/preset-env']
            }
        }
      }
    ]
  },
  externals: ['aws-sdk', 'mock-aws-s3', 'nock'],
  resolve: {
    fallback: {
      path: require.resolve('path-browserify')
    }
  },
  plugins: [
    // ... existing plugins
    new CopyPlugin({
      patterns: [
        { from: 'src/sql/dbMigrations', to: 'dbMigrations' },
      ],
    }),
  ],
}