# Practice Quiz Builder

A web application that turns your study materials into practice quizzes. Upload a **PDF**, **Word document (.docx)**, or **PowerPoint file (.pptx)**, choose how many questions you want, and hit **Make Quiz**.

## Features

- 📄 **Multi-format upload** — supports PDF, DOCX, and PPTX files via click or drag-and-drop
- 📝 **Text extraction** — reads all text content from the uploaded file (page by page for PDFs, slide by slide for PPTX)
- 🔢 **Question count selector** — choose between 1 and 50 questions using the stepper control
- ⚡ **Fast & client-side** — all file processing happens in the browser, no server needed

## Tech Stack

- [React 18](https://react.dev/) + [Vite](https://vitejs.dev/)
- [pdfjs-dist](https://mozilla.github.io/pdf.js/) — PDF text extraction
- [mammoth](https://github.com/mwilliamson/mammoth.js) — DOCX text extraction
- [jszip](https://stuk.github.io/jszip/) — PPTX parsing

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) v18 or higher

### Installation

```bash
# Clone the repository
git clone https://github.com/AbdullahDafor/practice-quiz-builder.git
cd practice-quiz-builder

# Install dependencies
npm install
```

### Running Locally

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Building for Production

```bash
npm run build
```

## Usage

1. **Upload a file** — drag and drop or click the upload area to select a PDF, DOCX, or PPTX file
2. **Set question count** — use the **−** / **+** buttons or type a number (1–50)
3. **Click Make Quiz** — the app extracts the text and logs it to the console (quiz generation coming soon)
