const { override, addWebpackResolve } = require('customize-cra');

module.exports = override(
  addWebpackResolve({
    extensions: ['.mjs', '.js', '.jsx', '.ts', '.tsx']
  })
);
