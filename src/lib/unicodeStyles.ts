export type UnicodeStyle = 'bold' | 'italic' | 'boldItalic'

const STYLE_BASES = {
  bold: {
    upper: 0x1d5d4,
    lower: 0x1d5ee,
    digit: 0x1d7ec,
  },
  italic: {
    upper: 0x1d608,
    lower: 0x1d622,
  },
  boldItalic: {
    upper: 0x1d63c,
    lower: 0x1d656,
  },
} as const

function mapChar(char: string, style: UnicodeStyle) {
  const code = char.codePointAt(0)

  if (!code) {
    return char
  }

  const bases = STYLE_BASES[style]

  if (code >= 65 && code <= 90) {
    return String.fromCodePoint(bases.upper + (code - 65))
  }

  if (code >= 97 && code <= 122) {
    return String.fromCodePoint(bases.lower + (code - 97))
  }

  if ('digit' in bases && code >= 48 && code <= 57) {
    return String.fromCodePoint(bases.digit + (code - 48))
  }

  return char
}

export function convertToStyledUnicode(text: string, style: UnicodeStyle) {
  return Array.from(text, (char) => mapChar(char, style)).join('')
}

export function applyMarkdownUnicode(markdown: string) {
  return markdown
    .replace(/\*\*\*([^*]+)\*\*\*/g, (_, value: string) => convertToStyledUnicode(value, 'boldItalic'))
    .replace(/\*\*([^*]+)\*\*/g, (_, value: string) => convertToStyledUnicode(value, 'bold'))
    .replace(/\*([^*]+)\*/g, (_, value: string) => convertToStyledUnicode(value, 'italic'))
}

export function applyStyleToRange(
  text: string,
  start: number,
  end: number,
  style: UnicodeStyle,
) {
  if (start === end) {
    return text
  }

  const from = Math.max(0, Math.min(start, end))
  const to = Math.min(text.length, Math.max(start, end))

  return `${text.slice(0, from)}${convertToStyledUnicode(text.slice(from, to), style)}${text.slice(to)}`
}
