import { useEffect, useMemo, useRef, useState } from 'react'
import './App.css'
import {
  applyMarkdownUnicode,
  applyStyleToRange,
  type UnicodeStyle,
} from './lib/unicodeStyles'

type PageKey = 'selection' | 'markdown'

const DEFAULT_EDITOR_TEXT =
  'Unicode fake-format hữu ích cho headline, bio, social caption. Bôi đen một đoạn ngắn rồi áp style để tạo chữ nhìn như bold hoặc italic.'
const DEFAULT_MARKDOWN =
  '# Launch note\n\n**Bold headline**\n*soft emphasis*\n***hybrid accent***\n\nDùng cho post, bio, title.'

const EDITOR_SNIPPETS = [
  'New drop available tonight',
  'Founder mode activated',
  'Minimal tools. Better taste.',
]

const MARKDOWN_SNIPPETS = [
  '**Quiet luxury** cho headline',
  '*Italic* để nhấn một nhịp nhỏ',
  '***Bold italic*** cho accent mạnh hơn',
]

const PAGE_COPY = {
  selection: {
    kicker: 'Workflow 01',
    title: 'Style bằng selection. Nhanh như utility, không giả làm word processor.',
    body: 'Trang này chỉ tập trung một việc: chọn đoạn text, áp Unicode style, rồi copy ra ngoài. Ít nhiễu, ít panel, ít mỏi mắt hơn.',
  },
  markdown: {
    kicker: 'Workflow 02',
    title: 'Viết bằng markdown, convert tức thì, rồi đẩy sang output sạch để paste.',
    body: 'Dành cho lúc bạn nghĩ bằng cú pháp trước. Gõ `** * ***`, xem output plain-text ngay, rồi copy hoặc chuyển tiếp sang editor chính.',
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
  const [isBooting, setIsBooting] = useState(true)
  const [isTransitioning, setIsTransitioning] = useState(false)
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

  useEffect(() => {
    const timer = window.setTimeout(() => setIsBooting(false), 920)
    return () => window.clearTimeout(timer)
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

    setIsTransitioning(true)
    window.setTimeout(() => {
      window.location.hash = nextPage === 'selection' ? '#selection' : '#markdown'
      setIsTransitioning(false)
    }, 420)
  }

  const resetEditor = () => {
    setEditorText(DEFAULT_EDITOR_TEXT)
    setSelection({ start: 0, end: 0 })
  }

  const resetMarkdown = () => {
    setMarkdownText(DEFAULT_MARKDOWN)
  }

  const isLoading = isBooting || isTransitioning

  return (
    <main className="app-shell">
      <div className={`loading-layer ${isLoading ? 'is-visible' : ''}`} aria-hidden={!isLoading}>
        <div className="loading-card-stack">
          <span className="icon-card icon-card-back">
            <span className="icon-card-dot" />
            <span className="icon-card-line icon-card-line-short" />
            <span className="icon-card-line icon-card-line-tiny" />
          </span>
          <span className="icon-card icon-card-mid">
            <span className="icon-card-dot" />
            <span className="icon-card-line icon-card-line-medium" />
            <span className="icon-card-line icon-card-line-short" />
          </span>
          <span className="icon-card icon-card-front">
            <span className="icon-card-dot" />
            <span className="icon-card-line icon-card-line-medium" />
            <span className="icon-card-accent" />
          </span>
        </div>
        <div className="loading-copy">
          <p className="section-label">Preparing workspace</p>
          <strong>Đang set nhịp cho editor…</strong>
        </div>
      </div>
      <header className="hero-shell">
        <div className="hero-mark" aria-hidden="true">
          <div className="hero-mark-card hero-mark-card-back">
            <span className="icon-card-dot" />
            <span className="icon-card-line icon-card-line-short" />
            <span className="icon-card-line icon-card-line-tiny" />
          </div>
          <div className="hero-mark-card hero-mark-card-mid">
            <span className="icon-card-dot" />
            <span className="icon-card-line icon-card-line-medium" />
            <span className="icon-card-line icon-card-line-short" />
          </div>
          <div className="hero-mark-card hero-mark-card-front">
            <span className="icon-card-dot" />
            <span className="icon-card-line icon-card-line-medium" />
            <span className="icon-card-accent" />
          </div>
        </div>

        <div className="hero-copy">
          <p className="topbar-kicker">Unicode craft utility</p>
          <h1>{PAGE_COPY[page].title}</h1>
          <p>{PAGE_COPY[page].body}</p>
        </div>

        <nav className="workflow-switcher" aria-label="Workflow switcher">
          <button
            className={`workflow-tab ${page === 'selection' ? 'is-active' : ''}`}
            type="button"
            onClick={() => setPageRoute('selection')}
          >
            <span className="workflow-step">01</span>
            <span>
              <strong>Selection styler</strong>
              <small>Bôi đen rồi format</small>
            </span>
          </button>
          <button
            className={`workflow-tab ${page === 'markdown' ? 'is-active' : ''}`}
            type="button"
            onClick={() => setPageRoute('markdown')}
          >
            <span className="workflow-step">02</span>
            <span>
              <strong>Markdown lab</strong>
              <small>Dùng `** * ***`</small>
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
                <h2>Selection styler</h2>
              </div>
              <div className="panel-actions">
                <button className="button button-ghost" type="button" onClick={resetEditor}>
                  Reset
                </button>
                <button
                  className="button button-primary"
                  type="button"
                  onClick={() => copyOutput(editorText, 'editor')}
                >
                  {copiedTarget === 'editor' ? 'Copied' : 'Copy Unicode'}
                </button>
              </div>
            </div>

            <div className="metrics-row">
              <div className="metric-chip">
                <span className="metric-label">Selected</span>
                <strong>{selectionSummary.count} ký tự</strong>
              </div>
              <div className="metric-chip metric-chip-preview">
                <span className="metric-label">Preview</span>
                <strong>{selectionSummary.preview}</strong>
              </div>
            </div>

            <div className="toolbar" role="toolbar" aria-label="Unicode toolbar">
              <button className="button button-tool" type="button" onClick={() => applyEditorStyle('bold')}>
                <span className="tool-glyph">𝗕</span>
                <span>Bold</span>
              </button>
              <button className="button button-tool" type="button" onClick={() => applyEditorStyle('italic')}>
                <span className="tool-glyph">𝘪</span>
                <span>Italic</span>
              </button>
              <button className="button button-tool" type="button" onClick={() => applyEditorStyle('boldItalic')}>
                <span className="tool-glyph">𝙗𝙞</span>
                <span>Bold italic</span>
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
                <span>Paste block cuối cùng</span>
              </div>
              <textarea id="editor-output" value={editorText} readOnly />
            </div>
          </article>

          <aside className="side-stack">
            <article className="panel panel-side panel-note">
              <p className="section-label">Tool rules</p>
              <h3>Làm đúng một việc, nhưng làm rõ.</h3>
              <ul className="guide-list">
                <li>Editor là surface chính, output là secondary.</li>
                <li>Toolbar ít nút, nhưng hit target lớn và dễ scan.</li>
                <li>Không ép user nhìn cùng lúc cả markdown lẫn selection.</li>
              </ul>
            </article>

            <article className="panel panel-side panel-note">
              <p className="section-label">Unsafe zones</p>
              <div className="pill-row pill-row-wrap">
                <span className="status-pill">Code</span>
                <span className="status-pill">Email</span>
                <span className="status-pill">URL</span>
                <span className="status-pill">Commands</span>
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
                <h2>Markdown lab</h2>
              </div>
              <div className="panel-actions">
                <button className="button button-ghost" type="button" onClick={resetMarkdown}>
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

            <div className="pill-row pill-row-wrap">
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
                <span>Plain-text sau khi bóc markdown</span>
              </div>
              <textarea id="markdown-output" value={markdownOutput} readOnly />
            </div>

            <button className="button button-apply" type="button" onClick={pushMarkdownToEditor}>
              Chuyển sang Selection page để style tiếp
            </button>
          </article>

          <aside className="side-stack">
            <article className="panel panel-side panel-note">
              <p className="section-label">Flow</p>
              <ol className="guide-list guide-list-ordered">
                <li>Gõ ý bằng markdown ngắn.</li>
                <li>Copy luôn, hoặc đẩy sang Selection page.</li>
                <li>Nếu cần nhấn mạnh thêm, style tiếp từng đoạn.</li>
              </ol>
            </article>

            <article className="panel panel-side panel-note panel-accent">
              <p className="section-label">Best use cases</p>
              <h3>Headlines, social posts, product launches, profile bios.</h3>
            </article>
          </aside>
        </section>
      )}
    </main>
  )
}

export default App
