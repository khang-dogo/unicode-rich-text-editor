import { useEffect, useMemo, useRef, useState } from 'react'
import './App.css'
import {
  applyMarkdownUnicode,
  applyStyleToRange,
  type UnicodeStyle,
} from './lib/unicodeStyles'

type PageKey = 'selection' | 'markdown'

const DEFAULT_EDITOR_TEXT =
  'Unicode fake-format hữu ích cho headline, bio, social caption. Bôi đen một đoạn ngắn rồi áp style để đổi chữ sang phiên bản nhìn như bold hoặc italic.'
const DEFAULT_MARKDOWN =
  '# Launch note\n\n**Bold headline**\n*soft emphasis*\n***hybrid accent***\n\nDùng cho post, bio, title.'

const EDITOR_SNIPPETS = ['Product launch tonight', 'Founder mode activated', 'Ship the cleaner version']
const MARKDOWN_SNIPPETS = [
  '**Quiet confidence** cho headline',
  '*Italic* để nhấn nhẹ một nhịp',
  '***Bold italic*** cho đoạn cần lực hơn',
]

const PAGE_COPY = {
  selection: {
    kicker: 'Direct editing',
    title: 'Edit trực tiếp rồi áp Unicode style lên đúng đoạn cần nhấn.',
    body: 'Bôi đen một đoạn ngắn, bấm style, copy ra ngoài. Không giả làm word processor. Không nhồi quá nhiều panel.',
  },
  markdown: {
    kicker: 'Markdown conversion',
    title: 'Gõ markdown trước, convert sang plain text sau, rồi paste đi nơi khác.',
    body: 'Phù hợp khi bạn nghĩ bằng cú pháp `** * ***` trước. Viết, convert, copy hoặc đẩy sang selection page để chỉnh tiếp.',
  },
} as const

function getPageFromHash(): PageKey {
  return window.location.hash === '#markdown' ? 'markdown' : 'selection'
}

function App() {
  const [page, setPage] = useState<PageKey>(() => getPageFromHash())
  const [editorText, setEditorText] = useState(DEFAULT_EDITOR_TEXT)
  const [markdownText, setMarkdownText] = useState(DEFAULT_MARKDOWN)
  const [selection, setSelection] = useState({ start: 0, end: 0 })
  const [copiedTarget, setCopiedTarget] = useState<'editor' | 'markdown' | null>(null)
  const editorRef = useRef<HTMLDivElement>(null)

  const markdownOutput = useMemo(() => applyMarkdownUnicode(markdownText), [markdownText])

  const selectionSummary = useMemo(() => {
    const from = Math.max(0, Math.min(selection.start, selection.end))
    const to = Math.min(editorText.length, Math.max(selection.start, selection.end))
    const selectedText = editorText.slice(from, to)

    return {
      count: selectedText.length,
      preview: selectedText || 'Chưa chọn đoạn nào',
    }
  }, [editorText, selection.end, selection.start])

  useEffect(() => {
    const handleHashChange = () => setPage(getPageFromHash())
    handleHashChange()
    window.addEventListener('hashchange', handleHashChange)
    return () => window.removeEventListener('hashchange', handleHashChange)
  }, [])

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
    setPageRoute('selection')
    requestAnimationFrame(() => {
      editorRef.current?.focus()
    })
  }

  const copyOutput = async (value: string, target: 'editor' | 'markdown') => {
    await navigator.clipboard.writeText(value)
    setCopiedTarget(target)
    window.setTimeout(() => setCopiedTarget(null), 1600)
  }

  const setPageRoute = (nextPage: PageKey) => {
    if (nextPage === page) {
      return
    }

    window.location.hash = nextPage === 'selection' ? '#selection' : '#markdown'
  }

  const resetEditor = () => {
    setEditorText(DEFAULT_EDITOR_TEXT)
    setSelection({ start: 0, end: 0 })
  }

  const resetMarkdown = () => {
    setMarkdownText(DEFAULT_MARKDOWN)
  }

  return (
    <main className="app-shell">
      <header className="hero-shell">
        <div className="hero-copy">
          <p className="eyebrow">Unicode format utility</p>
          <h1>{PAGE_COPY[page].title}</h1>
          <p className="hero-body">{PAGE_COPY[page].body}</p>
        </div>

        <div className="hero-meta">
          <div className="meta-card">
            <span className="meta-label">Output</span>
            <strong>Plain text</strong>
            <p>Không phải rich text thật. Paste được vào bio, post, headline.</p>
          </div>
          <div className="meta-card">
            <span className="meta-label">Unsafe</span>
            <strong>Code · URL · Email</strong>
            <p>Đừng dùng fake Unicode cho thứ cần parse chính xác.</p>
          </div>
        </div>

        <nav className="workflow-switcher" aria-label="Workflow switcher">
          <button
            className={`workflow-tab ${page === 'selection' ? 'is-active' : ''}`}
            type="button"
            onClick={() => setPageRoute('selection')}
          >
            <span className="workflow-step">01</span>
            <span>
              <strong>Selection</strong>
              <small>Bôi đen rồi áp style</small>
            </span>
          </button>
          <button
            className={`workflow-tab ${page === 'markdown' ? 'is-active' : ''}`}
            type="button"
            onClick={() => setPageRoute('markdown')}
          >
            <span className="workflow-step">02</span>
            <span>
              <strong>Markdown</strong>
              <small>Convert từ `** * ***`</small>
            </span>
          </button>
        </nav>
      </header>

      {page === 'selection' ? (
        <section className="page-grid">
          <article className="panel panel-main">
            <div className="panel-head">
              <div>
                <p className="section-label">{PAGE_COPY.selection.kicker}</p>
                <h2>Selection editor</h2>
              </div>
              <div className="panel-actions">
                <button className="button button-secondary" type="button" onClick={resetEditor}>
                  Reset
                </button>
                <button
                  className="button button-primary"
                  type="button"
                  onClick={() => copyOutput(editorText, 'editor')}
                >
                  {copiedTarget === 'editor' ? 'Copied' : 'Copy output'}
                </button>
              </div>
            </div>

            <div className="stats-grid">
              <div className="stat-card">
                <span className="stat-label">Selected</span>
                <strong>{selectionSummary.count} ký tự</strong>
              </div>
              <div className="stat-card stat-card-wide">
                <span className="stat-label">Preview</span>
                <strong>{selectionSummary.preview}</strong>
              </div>
            </div>

            <div className="toolbar" role="toolbar" aria-label="Unicode toolbar">
              <button className="button button-tool" type="button" onClick={() => applyEditorStyle('bold')}>
                <span className="tool-chip">B</span>
                <span>Bold</span>
              </button>
              <button className="button button-tool" type="button" onClick={() => applyEditorStyle('italic')}>
                <span className="tool-chip">I</span>
                <span>Italic</span>
              </button>
              <button className="button button-tool" type="button" onClick={() => applyEditorStyle('boldItalic')}>
                <span className="tool-chip">BI</span>
                <span>Bold + Italic</span>
              </button>
            </div>

            <div className="snippet-row">
              {EDITOR_SNIPPETS.map((snippet) => (
                <button
                  key={snippet}
                  className="snippet-button"
                  type="button"
                  onClick={() => setEditorText(snippet)}
                >
                  {snippet}
                </button>
              ))}
            </div>

            <div className="editor-frame">
              <div className="frame-label-row">
                <span>Editable canvas</span>
                <span>Chọn đoạn ngắn để ra kết quả sạch hơn</span>
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
            </div>

            <div className="output-block output-block-compact">
              <div className="frame-label-row">
                <label htmlFor="editor-output">Unicode output</label>
                <span>Khối text cuối cùng để copy</span>
              </div>
              <textarea id="editor-output" value={editorText} readOnly />
            </div>
          </article>

          <aside className="side-stack">
            <article className="panel panel-side">
              <p className="section-label">How to use</p>
              <ol className="guide-list guide-list-ordered">
                <li>Bôi đen đoạn cần nhấn.</li>
                <li>Chọn đúng style muốn áp.</li>
                <li>Copy output plain text để paste ra ngoài.</li>
              </ol>
            </article>

            <article className="panel panel-side">
              <p className="section-label">Good fits</p>
              <div className="pill-row">
                <span className="status-pill">Headline</span>
                <span className="status-pill">Bio</span>
                <span className="status-pill">Post</span>
                <span className="status-pill">Caption</span>
              </div>
            </article>
          </aside>
        </section>
      ) : (
        <section className="page-grid">
          <article className="panel panel-main">
            <div className="panel-head">
              <div>
                <p className="section-label">{PAGE_COPY.markdown.kicker}</p>
                <h2>Markdown converter</h2>
              </div>
              <div className="panel-actions">
                <button className="button button-secondary" type="button" onClick={resetMarkdown}>
                  Reset
                </button>
                <button
                  className="button button-primary"
                  type="button"
                  onClick={() => copyOutput(markdownOutput, 'markdown')}
                >
                  {copiedTarget === 'markdown' ? 'Copied' : 'Copy result'}
                </button>
              </div>
            </div>

            <div className="pill-row syntax-row">
              <span className="status-pill">**bold**</span>
              <span className="status-pill">*italic*</span>
              <span className="status-pill">***bold italic***</span>
            </div>

            <div className="snippet-row snippet-row-vertical">
              {MARKDOWN_SNIPPETS.map((snippet) => (
                <button
                  key={snippet}
                  className="snippet-button"
                  type="button"
                  onClick={() => setMarkdownText(snippet)}
                >
                  {snippet}
                </button>
              ))}
            </div>

            <div className="output-block">
              <div className="frame-label-row">
                <label htmlFor="markdown-input">Markdown input</label>
                <span>Viết theo cú pháp trước</span>
              </div>
              <textarea
                id="markdown-input"
                value={markdownText}
                onChange={(event) => setMarkdownText(event.target.value)}
              />
            </div>

            <div className="output-block">
              <div className="frame-label-row">
                <label htmlFor="markdown-output">Converted output</label>
                <span>Plain text sau khi bóc markdown</span>
              </div>
              <textarea id="markdown-output" value={markdownOutput} readOnly />
            </div>

            <button className="button button-primary button-wide" type="button" onClick={pushMarkdownToEditor}>
              Đẩy sang selection editor
            </button>
          </article>

          <aside className="side-stack">
            <article className="panel panel-side">
              <p className="section-label">Flow</p>
              <ol className="guide-list guide-list-ordered">
                <li>Gõ bằng markdown ngắn.</li>
                <li>Convert sang output plain text.</li>
                <li>Nếu cần, đẩy sang selection page để chỉnh tiếp.</li>
              </ol>
            </article>

            <article className="panel panel-side">
              <p className="section-label">Best for</p>
              <p className="aside-copy">
                Dùng khi bạn viết nhanh bằng cú pháp rồi mới quyết định đoạn nào cần nhấn mạnh hơn.
              </p>
            </article>
          </aside>
        </section>
      )}
    </main>
  )
}

export default App
