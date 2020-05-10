const path = require('path');
const VueLoaderPlugin = require('vue-loader/lib/plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');
const { EnvironmentPlugin } = require('webpack')

function modifyManifest(buffer) {
  let manifest = JSON.parse(buffer.toString());

  // make any modifications you like, such as
  if (process.env.VERSION) {
    manifest.version = process.env.VERSION;
  }

  // pretty print to JSON with two spaces
  manifest_JSON = JSON.stringify(manifest, null, 2);
  return manifest_JSON;
}

module.exports = {
  mode: process.env.NODE_ENV || 'development',
  entry: {
    background: './src/background.js',
    content_script: './src/content_script.js',
    start: './src/start.js',
    popup: './src/popup.js'
  },
  output: {
    filename: 'static/[name].js',
    path: path.resolve(__dirname, 'dist')
  },
  resolve: {
    alias: {
      vue: 'vue/dist/vue.runtime.esm.js'
    }
  },
  module: {
    rules: [
      {
        test: /\.(png|jpg|gif)$/i,
        use: [
          {
            loader: 'url-loader',
            loader: 'file-loader',
            options: {
              limit: 8192,
              outputPath: 'images',
              esModule: false
            },
          },
        ],
      },
      {
        test: /\.svg$/,
        use: [
          'svg-url-loader',
        ]
      },
      {
        test: /\.less$/,
        use: [
          'vue-style-loader',
          'css-loader',
          'less-loader'
        ]
      },
      {
        test: /\.css$/i,
        use: ['style-loader', 'css-loader'],
      },
      {
        test: /\.vue$/,
        loader: 'vue-loader'
      }
    ]
  },
  plugins: [
    new CleanWebpackPlugin(),
    new CopyPlugin([
      {
        from: "public/manifest.json",
        to: "./manifest.json",
        transform(content, path) {
          return modifyManifest(content)
        }
      },
      { from: 'public', to: '.' },
      {
        from: 'static/image/icon',
        to: 'static/image'
      },
      {
        from: 'node_modules/@sunoj/touchemulator/touch-emulator.js',
        to: 'static'
      },
      {
        from: 'node_modules/zepto/dist/zepto.min.js',
        to: 'static'
      }
    ]),
    new VueLoaderPlugin(),
    new EnvironmentPlugin({
      NODE_ENV: 'development',
      BROWSER: 'chrome',
      VERSION: '0.1.1',
      BUILDID: 0
    })
  ]
};