import postcss from 'postcss'
import postcssModular from 'postcss-modular'
import cssnano from 'cssnano'
import loaderUtils from 'loader-utils'
import Tokenizer from 'css-selector-tokenizer'

const parserPlugin = postcss.plugin('css-loader-parser', options => (css, result) => {
  const urlItems = []
  const processNode = item => {
    switch (item.type) {
      case 'value':
        item.nodes.forEach(processNode)
        break
      case 'nested-item':
        item.nodes.forEach(processNode)
        break
      case 'url':
        if (
          options.url &&
          item.url.replace(/\s/g, '').length &&
          !/^#/.test(item.url) &&
          loaderUtils.isUrlRequest(item.url, options.root)
        ) {
          // Don't remove quotes around url when contain space
          if (item.url.indexOf(' ') === -1) {
            item.stringType = ''
          }
          delete item.innerSpacingBefore
          delete item.innerSpacingAfter
          const { url } = item
          item.url = `___CSS_LOADER_URL___${urlItems.length}___`
          urlItems.push({ url })
        }
        break
      default:
        break
    }
  }

  css.walkDecls(decl => {
    const values = Tokenizer.parseValues(decl.value)
    values.nodes.forEach(value => value.nodes.forEach(processNode))
    decl.value = Tokenizer.stringifyValues(values)
  })

  result.urlItemRegExpG = /___CSS_LOADER_URL___([0-9]+)___/g
  result.urlItemRegExp = /___CSS_LOADER_URL___([0-9]+)___/
  result.urlItems = urlItems
})

module.exports = function processCSS(css, options, map, context) {
  let inputMap = map
  if (options.sourceMap) {
    if (map) {
      if (typeof map === 'string') {
        inputMap = JSON.stringify(map)
      }

      if (map.sources) {
        inputMap.sources = map.sources.map(source => source.replace(/\\/g, '/'))
        inputMap.sourceRoot = ''
      }
    }
  } else {
    inputMap = null
  }

  const pipeline = postcss([postcssModular(options), parserPlugin(options)])

  if (options.minimize) {
    const minimizeOptions = Object.assign({}, options.minimize);
    [
      'zindex',
      'normalizeUrl',
      'discardUnused',
      'mergeIdents',
      'reduceIdents',
      'autoprefixer',
    ].forEach(name => {
      if (typeof minimizeOptions[name] === 'undefined') {
        minimizeOptions[name] = false
      }
    })
    pipeline.use(cssnano(minimizeOptions))
  }

  return pipeline
    .process(css, {
      // we need a prefix to avoid path rewriting of PostCSS
      to: options.to,
      from: options.from,
      map: options.sourceMap
        ? {
          prev: inputMap,
          sourcesContent: true,
          inline: false,
          annotation: false,
        }
        : null,
    })
    .then(result => {
      const { urlItems } = result

      result.cssJS = JSON.stringify(result.css)

      if (options.url) {
        result.cssJS = result.cssJS.replace(result.urlItemRegExpG, (match, index) => {
          const { url } = urlItems[index]
          let idx = url.indexOf('?#')
          if (idx < 0) idx = url.indexOf('#')
          let urlRequest = url
          if (idx > 0) {
            urlRequest = url.substr(0, idx)
            return `" + require(${loaderUtils.stringifyRequest(
              context,
              urlRequest,
            )}") + "${url.substr(idx)}`
          }

          return `" + require(${loaderUtils.stringifyRequest(context, urlRequest)}) + "`
        })
      }

      return result
    })
}
