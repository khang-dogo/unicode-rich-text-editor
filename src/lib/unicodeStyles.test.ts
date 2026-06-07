import { describe, expect, it } from 'vitest'
import {
  applyMarkdownUnicode,
  applyStyleToRange,
  convertToStyledUnicode,
} from './unicodeStyles'

describe('convertToStyledUnicode', () => {
  it('converts latin text and digits to bold unicode', () => {
    expect(convertToStyledUnicode('Abc 123', 'bold')).toBe('𝗔𝗯𝗰 𝟭𝟮𝟯')
  })

  it('keeps unsupported characters unchanged', () => {
    expect(convertToStyledUnicode('Xin chào 🚀', 'italic')).toBe('𝘟𝘪𝘯 𝘤𝘩à𝘰 🚀')
  })
})

describe('applyMarkdownUnicode', () => {
  it('formats markdown markers into unicode styles', () => {
    expect(applyMarkdownUnicode('**Bold** *italic* ***mix***')).toBe(
      '𝗕𝗼𝗹𝗱 𝘪𝘵𝘢𝘭𝘪𝘤 𝙢𝙞𝙭',
    )
  })

  it('supports nesting priority by matching bold italic first', () => {
    expect(applyMarkdownUnicode('hello ***wow*** end')).toBe('hello 𝙬𝙤𝙬 end')
  })
})

describe('applyStyleToRange', () => {
  it('styles only the selected substring', () => {
    expect(applyStyleToRange('hello world', 6, 11, 'boldItalic')).toBe('hello 𝙬𝙤𝙧𝙡𝙙')
  })

  it('returns original text when selection is empty', () => {
    expect(applyStyleToRange('hello world', 3, 3, 'bold')).toBe('hello world')
  })
})
