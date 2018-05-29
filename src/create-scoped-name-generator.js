import stringHash from 'string-hash'

const RE_VALID_LETTER = /^[_a-zA-Z]/
export default function createClassNameResolver({ production }) {
  return (name, filename) => {
    const hash = stringHash(`${name}${filename}`).toString(36)
    const secondPart = hash.substr(5, 8)
    const validFirstLetter = RE_VALID_LETTER.test(hash.charAt(0))

    return `${validFirstLetter ? '' : '_'}${production ? '' : `${name}_`}${hash.substr(
      0,
      5,
    )}${secondPart && `-${secondPart}`}`
  }
}
