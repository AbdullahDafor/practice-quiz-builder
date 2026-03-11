import { useState, useRef } from 'react'
import './App.css'
import * as pdfjsLib from 'pdfjs-dist'
import mammoth from 'mammoth'
import JSZip from 'jszip'

// Point the PDF.js worker at the bundled worker file
pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url
).toString()

const ACCEPTED_TYPES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
]
const ACCEPTED_EXTENSIONS = '.pdf,.docx,.pptx'

// --- Extractors ---

async function extractPdfText(arrayBuffer) {
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise
  console.log(`PDF loaded — ${pdf.numPages} page(s) found.`)
  let text = ''
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i)
    const content = await page.getTextContent()
    text += `\n--- Page ${i} ---\n` + content.items.map((item) => item.str).join(' ')
  }
  return text
}

async function extractDocxText(arrayBuffer) {
  const result = await mammoth.extractRawText({ arrayBuffer })
  return result.value
}

async function extractPptxText(arrayBuffer) {
  const zip = await JSZip.loadAsync(arrayBuffer)
  // Slides live at ppt/slides/slide*.xml
  const slideFiles = Object.keys(zip.files)
    .filter((name) => /^ppt\/slides\/slide\d+\.xml$/.test(name))
    .sort() // ensure slide order

  let text = ''
  for (const slideName of slideFiles) {
    const xml = await zip.files[slideName].async('string')
    // Extract text from <a:t> elements
    const matches = [...xml.matchAll(/<a:t[^>]*>([^<]*)<\/a:t>/g)]
    const slideText = matches.map((m) => m[1]).join(' ')
    const slideNum = slideName.match(/slide(\d+)/)[1]
    text += `\n--- Slide ${slideNum} ---\n${slideText}`
  }
  return text
}

function App() {
  const [file, setFile] = useState(null)
  const [isDragging, setIsDragging] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const fileInputRef = useRef(null)

  const handleFileChange = (e) => {
    const selected = e.target.files[0]
    if (selected && ACCEPTED_TYPES.includes(selected.type)) {
      setFile(selected)
    }
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => setIsDragging(false)

  const handleDrop = (e) => {
    e.preventDefault()
    setIsDragging(false)
    const dropped = e.dataTransfer.files[0]
    if (dropped && ACCEPTED_TYPES.includes(dropped.type)) {
      setFile(dropped)
    }
  }

  const handleRemoveFile = () => {
    setFile(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handleMakeQuiz = async () => {
    if (!file) return
    setIsLoading(true)

    try {
      const arrayBuffer = await file.arrayBuffer()
      let fullText = ''

      if (file.type === 'application/pdf') {
        fullText = await extractPdfText(arrayBuffer)
        console.log('Extracted PDF text:\n', fullText)
      } else if (file.name.endsWith('.docx')) {
        fullText = await extractDocxText(arrayBuffer)
        console.log('Extracted DOCX text:\n', fullText)
      } else if (file.name.endsWith('.pptx')) {
        fullText = await extractPptxText(arrayBuffer)
        console.log('Extracted PPTX text:\n', fullText)
      }
    } catch (err) {
      console.error('Failed to extract text:', err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="card">
      {/* Header */}
      <div className="header">
        <div className="logo">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            <rect x="9" y="3" width="6" height="4" rx="1" stroke="currentColor" strokeWidth="2"/>
            <path d="M9 12h6M9 16h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </div>
        <h1 className="title">Practice Quiz Builder</h1>
        <p className="subtitle">Upload a PDF and instantly generate a practice quiz from it.</p>
      </div>

      {/* Upload area */}
      <div
        className={`upload-zone ${isDragging ? 'dragging' : ''} ${file ? 'has-file' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !file && fileInputRef.current?.click()}
        role="button"
        tabIndex={0}
        aria-label="PDF upload area"
        onKeyDown={(e) => e.key === 'Enter' && !file && fileInputRef.current?.click()}
      >
        <input
          id="pdf-upload"
          ref={fileInputRef}
          type="file"
          accept={ACCEPTED_EXTENSIONS}
          className="file-input"
          onChange={handleFileChange}
          aria-label="Upload file"
        />

        {file ? (
          <div className="file-preview">
            <div className="file-icon">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"/>
                <path d="M14 2v6h6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
                <path d="M9 13h6M9 17h4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
              </svg>
              <span className="pdf-badge">{file.name.split('.').pop().toUpperCase()}</span>
            </div>
            <div className="file-info">
              <span className="file-name">{file.name}</span>
              <span className="file-size">{(file.size / 1024).toFixed(1)} KB</span>
            </div>
            <button
              className="remove-btn"
              onClick={(e) => { e.stopPropagation(); handleRemoveFile() }}
              aria-label="Remove file"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </button>
          </div>
        ) : (
          <div className="upload-prompt">
            <div className="upload-icon">
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
                <path d="M17 8l-5-5-5 5M12 3v12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <p className="upload-main">Drop your file here</p>
            <p className="upload-hint">or <span className="upload-link">browse to upload</span></p>
            <p className="upload-formats">Accepts PDF, DOCX, and PPTX files</p>
          </div>
        )}
      </div>

      {/* Action button */}
      <button
        id="make-quiz-btn"
        className={`make-quiz-btn ${!file ? 'disabled' : ''} ${isLoading ? 'loading' : ''}`}
        onClick={handleMakeQuiz}
        disabled={!file || isLoading}
        aria-disabled={!file || isLoading}
      >
        {isLoading ? (
          <>
            <span className="spinner" aria-hidden="true" />
            Generating Quiz…
          </>
        ) : (
          <>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
            </svg>
            Make Quiz
          </>
        )}
      </button>
    </div>
  )
}

export default App
