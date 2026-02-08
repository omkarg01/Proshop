const { override, addWebpackResolve, addPostcssPlugins } = require('customize-cra');
const path = require('path');

module.exports = override(
  addWebpackResolve({
    extensions: ['.mjs', '.js', '.jsx', '.ts', '.tsx'],
    alias: {
      '@': path.resolve(__dirname, 'src')
    }
  }),
  addPostcssPlugins([
    require('tailwindcss'),
    require('autoprefixer')
  ])
);
