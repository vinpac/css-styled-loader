import fs from 'fs'
import path from 'path'

export default function createPathResolver(context, request) {
  return (moduleRequest, dirpath, options) => {
    const aliasArr = []
    let resolvedPath

    try {
      const { alias } = context.options.resolve
      Object.keys(alias).forEach(key => {
        aliasArr.push({
          regex: new RegExp(/\^|\$/g.test(key) ? key : `^${key}`),
          path: alias[key],
        })
      })
    } catch (error) {
      // ...
    }

    const aliasMatch = aliasArr.find(aliasItem => aliasItem.regex.test(moduleRequest))
    if (aliasMatch) {
      resolvedPath = moduleRequest.replace(aliasMatch.regex, aliasMatch.path)
    } else {
      resolvedPath = path.resolve(path.dirname(request), moduleRequest).replace(/^\/css-loader/, '')
    }

    const hasExtension = /\.\w+$/.test(moduleRequest)
    const possiblePaths = []

    if (hasExtension) {
      possiblePaths.push(resolvedPath)
    } else {
      possiblePaths.push(`${resolvedPath}${options.extension}`)
      possiblePaths.push(
        path.join(resolvedPath, `${path.basename(resolvedPath)}${options.extension}`),
      )
    }

    const existingPath = possiblePaths.find(possiblePath => fs.existsSync(possiblePath))

    if (existingPath) {
      return `/css-loader${existingPath}`
    }

    const p = possiblePaths.length > 1
    throw new Error(
      `File${p ? 's' : ''} '${possiblePaths.join('\' or \'')}' ${p ? 'do' : 'does'} no exist`,
    )
  }
}
