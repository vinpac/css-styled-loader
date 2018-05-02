import path from 'path'
import loaderUtils from 'loader-utils'
import stringHash from 'string-hash'
import processCSS from './process-css'
import createPathResolver from './create-path-resolver'

const globalStore = {}
const isTest = process.env.NODE_ENV === 'test'

module.exports = function cssLoader(rawCSS, map) {
  if (this.cacheable) {
    this.cacheable()
  }

  const callback = this.async()
  const options = loaderUtils.getOptions(this) || {}

  const fromValue = `/css-loader/${loaderUtils
    .getRemainingRequest(this)
    .split('!')
    .pop()}`

  processCSS(
    rawCSS,
    Object.assign({}, options, {
      from: fromValue,
      to: loaderUtils
        .getRemainingRequest(this)
        .split('!')
        .pop(),
      url: true,
      store: globalStore,
      extension: options.extension || '.css',
      sourceMap: options.sourceMap || false,
      resolvePath: createPathResolver(this, fromValue),
      // As webpack imports in not standart sort
      useNoImported: 'ignore',
    }),
    map,
    this,
  )
    .then(result => {
      callback(
        null,
        `
          Object.defineProperty(exports, "__esModule", {
            value: true
          });

          var css = ${result.cssJS}
          exports.default = ${JSON.stringify(result.translations)};
          exports.sheet = {
            id: "${stringHash(fromValue)}",
            css: css,
            matches: require(${loaderUtils.stringifyRequest(
              this,
              `${isTest ? '' : '!'}${path.resolve(__dirname, '..', 'dist', 'create-matches')}`,
            )}).default(css)
          };
          ${
            options.hmr
              ? `
          var updatedCSS;

          if (window.STYLED_CSS_DEV$ON_SHEET_CHANGE && updatedCSS !== exports.sheet.css) {
            updatedCSS = exports.sheet.css;
            window.STYLED_CSS_DEV$ON_SHEET_CHANGE(exports.sheet);
          }

          ;(function (sheet) {
            if(!sheet) return
            if (!module.hot) return
            module.hot.accept()
            if (module.hot.status() === 'idle') return
            if (window.STYLED_CSS_DEV$ON_SHEET_CHANGE && updatedCSS !== sheet.css) {
              updatedCSS = sheet.css;
              window.STYLED_CSS_DEV$ON_SHEET_CHANGE(sheet);
            }
          })(typeof __webpack_exports__ !== 'undefined'
            ? __webpack_exports__.sheet
            : (exports.sheet || module.exports.sheet || module.exports)
          );
          `
              : ''
          }
        `,
      )
    })
    .catch(callback)
}
