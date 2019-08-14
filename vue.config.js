const path = require('path');
const config = require('./lib.config');

module.exports = {
  productionSourceMap: false,
  css: {
    loaderOptions: {
      css: {
        localIdentName:
          config.namespace +
          config.separator +
          '[name]' +
          config.separator +
          '[local]',
        camelCase: 'only'
      }
    }
  }
};
