module.exports = {
  plugins: {
    'postcss-pxtorem': {
      rootValue: 16,
      propWhiteList: [
        '*',
        '!border',
        '!border-top',
        '!border-right',
        '!border-bottom',
        '!border-left',
        '!border-width'
      ],
      selectorBlackList: ['html'],
      mediaQuery: false
    },
    'postcss-preset-env': {
      stage: 0
    },
    autoprefixer: {}
  }
};