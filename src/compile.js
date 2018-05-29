export default function compileCSS(sheet, variables) {
  if (!sheet.matches.length) {
    return sheet.css
  }

  let result = sheet.css
  let diff = 0
  let i = 0
  for (; i < sheet.matches.length; i += 1) {
    const match = sheet.matches[i]
    const name = sheet.css.substr(match[0] + 2, match[1] - 2)

    if (!variables[name]) {
      throw new Error(`Expected value for variable '${name}'. At 0:${match[0]}:${match[1]}'`)
    }

    result = `${result.substr(0, match[0] + diff)}${variables[name]}${result.substr(
      match[0] + diff + match[1],
    )}`
    diff += variables[name].length - match[1]
  }

  return result
}
