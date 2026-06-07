import { useMemo, useRef, useState } from 'react'
import './App.css'
import {
  applyMarkdownUnicode,
  applyStyleToRange,
  type UnicodeStyle,
} from './lib/unicodeStyles'

const DEFAULT_EDITOR_TEXT = 'Bôi đen đoạn text này rồi bấm Bold / Italic / Bold Italic.'
const DEFAULT_MARKDOWN = '# Unicode fake format\n\n**Bold** *italic* ***mix***\n\nDùng cho bio, post, headline.'

function App() {
  const [editorText, setEditorText] = useState(DEFAULT_EDITOR_TEXT)
  const [markdownText, setMarkdownText] = useState(DEFAULT_MARKDOWN)
  const [selection, setSelection] = useState({ start: 0, end: 0 })
  const editorRef = useRef<HTMLDivElement>(null)

  const markdownOutput = useMemo(() => applyMarkdownUnicode(markdownText), [markdownText])

  const syncSelection = () => {
    const selectionApi = window.getSelection()
    const editor = editorRef.current

    if (!selectionApi || !editor || selectionApi.rangeCount === 0) {
      return
    }

    const range = selectionApi.getRangeAt(0)

    if (!editor.contains(range.startContainer) || !editor.contains(range.endContainer)) {
      return
    }

    const preStart = range.cloneRange()
    preStart.selectNodeContents(editor)
    preStart.setEnd(range.startContainer, range.startOffset)

    const preEnd = range.cloneRange()
    preEnd.selectNodeContents(editor)
    preEnd.setEnd(range.endContainer, range.endOffset)

    setSelection({
      start: preStart.toString().length,
      end: preEnd.toString().length,
    })
  }

  const handleEditorInput = (event: React.FormEvent<HTMLDivElement>) => {
    setEditorText(event.currentTarget.textContent ?? '')
    syncSelection()
  }

  const applyEditorStyle = (style: UnicodeStyle) => {
    const next = applyStyleToRange(editorText, selection.start, selection.end, style)
    setEditorText(next)

    requestAnimationFrame(() => {
      editorRef.current?.focus()
    })
  }

  const pushMarkdownToEditor = () => {
    setEditorText(markdownOutput)
  }

  const copyOutput = async (value: string) => {
    await navigator.clipboard.writeText(value)
  }

  return (
    <main className="app-shell">
      <section className="hero-card">
        <div>
          <p className="eyebrow">Unicode Rich Text Playground</p>
          <h1>Editor fake Unicode cho bold / italic / bold italic</h1>
          <p className="hero-copy">
            Có 2 mode: edit trực tiếp bằng cách bôi đen text, hoặc nhập markdown rồi convert sang Unicode giả định dạng.
          </p>
        </div>
        <div className="chip-row">
          <span className="chip">Direct edit</span>
          <span className="chip">Markdown → Unicode</span>
          <span className="chip">Copy nhanh</span>
        </div>
      </section>

      <section className="grid-layout">
        <article className="panel">
          <div className="panel-header">
            <div>
              <p className="panel-kicker">Tính năng 1</p>
              <h2>Edit trực tiếp</h2>
            </div>
            <button className="ghost-button" type="button" onClick={() => copyOutput(editorText)}>
              Copy output
            </button>
          </div>

          <div className="toolbar" role="toolbar" aria-label="Unicode toolbar">
            <button type="button" onClick={() => applyEditorStyle('bold')}>
              𝗕 Bold
            </button>
            <button type="button" onClick={() => applyEditorStyle('italic')}>
              𝘪 Italic
            </button>
            <button type="button" onClick={() => applyEditorStyle('boldItalic')}>
              𝙗𝙞 Bold Italic
            </button>
          </div>

          <div
            ref={editorRef}
            className="editor-surface"
            contentEditable
            suppressContentEditableWarning
            onInput={handleEditorInput}
            onKeyUp={syncSelection}
            onMouseUp={syncSelection}
          >
            {editorText}
          </div>

          <div className="output-block">
            <label htmlFor="editor-output">Plain output</label>
            <textarea id="editor-output" value={editorText} readOnly />
          </div>
        </article>

        <article className="panel">
          <div className="panel-header">
            <div>
              <p className="panel-kicker">Tính năng 2</p>
              <h2>Format markdown qua dấu `*`</h2>
            </div>
            <button className="ghost-button" type="button" onClick={() => copyOutput(markdownOutput)}>
              Copy converted
            </button>
          </div>

          <div className="markdown-help">
            <span>`**bold**`</span>
            <span>`*italic*`</span>
            <span>`***bold italic***`</span>
          </div>

          <div className="output-block">
            <label htmlFor="markdown-input">Markdown input</label>
            <textarea
              id="markdown-input"
              value={markdownText}
              onChange={(event) => setMarkdownText(event.target.value)}
            />
          </div>

          <div className="output-block">
            <label htmlFor="markdown-output">Converted output</label>
            <textarea id="markdown-output" value={markdownOutput} readOnly />
          </div>

          <button className="primary-button" type="button" onClick={pushMarkdownToEditor}>
            Đưa output sang editor trực tiếp
          </button>
        </article>
      </section>
    </main>
  )
}

export default App
