const getConfig = require('hjs-webpack');

// TODO -- sort out a development soln
const isDev = process.env.NODE_ENV === 'development';

var config = getConfig({
  isDev: isDev,
  in: join(src, 'app.js'),
  out: dest,
  html: function (context) {
    return {
      'index.html': context.defaultTemplate({
        title: 'yelp-clone from fullstackreact.com',
        publicPath: isDev ? 'http://localhost:3000/' : '',
        meta: {
          'name': 'fullstackreact yelp clone',
          'description': 'A minimal yelp clone from the team behind the fullstackreact.com book'
        }
      })
    }
  }
});


//
//
//
// const HtmlWebpackPlugin = require('html-webpack-plugin')
//
// module.exports = {
//   entry: './ui/index.js',
//   output: {
//     publicPath: '/'
//   },
//   module: {
//     loaders: [{
//       test: /\.css/,
//       loader: 'style!css'
//     }, {
//       test: /\.js$/,
//       loader: 'babel',
//       exclude: /node_modules/
//     }, {
//       test: /\.json$/,
//       loader: 'json'
//     }]
//   },
//   plugins: [
//     new HtmlWebpackPlugin({
//       template: 'ui/index.html'
//     })
//   ],
//   devServer: {
//     proxy: {
//       "/graphql": "http://localhost:3010/graphql",
//       "/login/*": "http://localhost:3010",
//       "/logout": "http://localhost:3010"
//     },
//     historyApiFallback: {
//       index: '/',
//     },
//   },
// }
