/* eslint-disable global-require, import/no-dynamic-require */

import fs from 'fs'
import path from 'path'
import mkdirp from 'mkdirp'
import { parse } from './_helpers'

mkdirp(path.resolve('tmp'))
let tempIndex = 0
const writeTemp = content =>
  new Promise((resolve, reject) => {
    tempIndex += 1
    const filepath = path.resolve('tmp', `output-${tempIndex}.js`)
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
      id: '1651403073',
      css:
        '\n        ._className1_1c124_9l { color: --color-primary; }\n        ._className2_v3t16_ { color: --color-accent; }\n      ',
      matches: [[40, 15], [96, 14]],
    })
  })

  test.skip('enable hmr', async done => {
    const result = await parse(
      `
        .className1 { color: --color-primary; }
        .className2 { color: --color-accent; }
      `,
      null,
      { hmr: true, sourceMap: true },
    )

    const filepath = await writeTemp(result)
    const { sheet } = require(filepath)
    expect(typeof sheet._changeHook.tap).toBe('function')
    expect(typeof sheet._changeHook.call).toBe('function')
    expect(sheet).toEqual({
      id: '1651403073',
      _changeHook: {
        consumers: [],
        tap: sheet._changeHook.tap,
        call: sheet._changeHook.call,
      },
      css:
        '\n        ._className1_1c124_9l { color: --color-primary; }\n        ._className2_v3t16_ { color: --color-accent; }\n      ',
      matches: [[40, 15], [96, 14]],
    })

    let untap
    const handleChange = updatedCSS => {
      expect(updatedCSS).toEqual('new css')
      expect(sheet.css).toEqual('new css')
      untap()
      expect(sheet._changeHook.consumers).toEqual([])
      done()
    }

    untap = sheet._changeHook.tap(handleChange)
    expect(sheet._changeHook.consumers).toEqual([handleChange])
    sheet._changeHook.call('new css')
  })
})
