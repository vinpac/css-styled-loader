const RE_VARIABLE = /--([\w-]+)/g

export default function createMatches(css) {
  const matches = []
  let match = RE_VARIABLE.exec(css)
  while (match) {
    let n = match.index - 1
    let isValidMatch = true
    let str = ''
    for (; n !== 0; n -= 1) {
      if (css[n] !== '\t' && css[n] !== ' ') {
        str += css[n]

        if (css[n] !== '(' && css[n] !== 'v' && css[n] !== 'a' && css[n] !== 'r') {
          break
        }

        if (str.length >= 4) {
          isValidMatch = false
          break
        }
      }
    }

    if (isValidMatch) {
      matches.push([match.index, match[0].length])
    }

    match = RE_VARIABLE.exec(css)
  }

  return matches
}
