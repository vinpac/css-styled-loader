import path from 'path'
import cssModularLoader from '../src/loader'

export function runLoader(loader, input, map, options, callback) {
  loader.call(
    {
      callback,
      async: () => callback,
      options: Object.assign(
        {
          resolve: {
            alias: {
              Fix: path.resolve(__dirname, 'fixtures'),
            },
          },
          context: '',
        },
        options,
      ),
      loaders: [{ request: '/path/css-loader' }],
      loaderIndex: 0,
      context: '',
      resource: 'test.css',
      resourcePath: 'test.css',
      request: 'css-loader!test.css',
      emitError: message => {
        throw new Error(message)
      },
    },
    input,
    map,
  )
}

export function parse(input, map, options) {
  return new Promise((resolve, reject) => {
    runLoader(cssModularLoader, input, map, options, (error, result) => {
      if (error) {
        reject(error)
      } else {
        resolve(result)
      }
    })
  })
}
