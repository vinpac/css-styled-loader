/* eslint-disable global-require, import/no-dynamic-require */

import fs from 'fs'
import path from 'path'
import mkdirp from 'mkdirp'
import { parse } from './_helpers'

mkdirp(path.resolve('tmp'))
const writeTemp = content =>
  new Promise((resolve, reject) => {
    const filepath = path.resolve('tmp', 'output.js')
    fs.writeFile(filepath, content, error => {
      if (error) {
        reject(error)
        return
      }

      resolve(filepath)
    })
  })

describe('Loader', () => {
  it('should compile and run the script', async () => {
    const result = await parse(
      `
        .className1 { color: --color-primary; }
        .className2 { color: --color-accent; }
      `,
      null,
      { sourceMap: true },
    )

    const filepath = await writeTemp(result)
    const { sheet } = require(filepath)
    expect(sheet).toEqual({
      id: '2949807648',
      css:
        '\n        ._className1_1c124_9l { color: --color-primary; }\n        ._className2_v3t16_ { color: --color-accent; }\n      ',
      matches: [[40, 15], [96, 14]],
    })
  })
})
