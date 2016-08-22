const HtmlWebpackPlugin = require('html-webpack-plugin')

module.exports = {
  entry: './ui/index.js',
  output: {
    publicPath: '/'
  },
  module: {
    loaders: [{
      test: /\.css/,
      loader: 'style!css'
    }, {
      test: /\.js$/,
      loader: 'babel',
      // Exclude apollo client from the webpack config in case
      // we want to use npm link.
      exclude: /(node_modules)|(apollo-client)/
    }, {
      test: /\.json$/,
      loader: 'json'
    }]
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: 'ui/index.html'
    })
  ],
  devServer: {
    proxy: {
      "/graphql": "http://localhost:3010/graphql",
      "/graphiql": "http://localhost:3010/graphiql",
      "/login/*": "http://localhost:3010",
      "/logout": "http://localhost:3010"
    },
    historyApiFallback: {
      index: '/',
    },
  },
}
