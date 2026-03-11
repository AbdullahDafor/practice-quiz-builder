import { GoogleGenerativeAI } from '@google/generative-ai'

// Read from .env.local (Vite exposes vars prefixed with VITE_)
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY
const MODEL_NAME = import.meta.env.VITE_GEMINI_MODEL || 'gemini-1.5-flash'

if (!API_KEY || API_KEY === 'paste_your_api_key_here') {
  console.warn(
    '[ai.js] ⚠️  No Gemini API key found.\n' +
      'Open .env.local and set VITE_GEMINI_API_KEY to your real key, then restart the dev server.'
  )
}

const genAI = new GoogleGenerativeAI(API_KEY)

/**
 * Sends the document text to Gemini and asks it to generate a multiple-choice quiz.
 *
 * @param {string} documentText  - The full extracted text from the uploaded file.
 * @param {number} questionCount - How many questions to generate.
 * @returns {Promise<string>}    - The raw AI response (text).
 */
export async function generateQuiz(documentText, questionCount) {
  const model = genAI.getGenerativeModel({ model: MODEL_NAME })

  const prompt = `
You are an expert quiz maker. Based on the document text below, generate a multiple-choice practice quiz with exactly ${questionCount} questions.

Requirements:
- Each question must have 4 answer choices labeled A, B, C, and D.
- Clearly indicate the correct answer after each question.
- Focus on the key concepts and important information from the text.
- Questions should vary in difficulty (easy, medium, hard).

Format every question exactly like this:
Q1. [Question text]
A) [Choice A]
B) [Choice B]
C) [Choice C]
D) [Choice D]
Answer: [Correct letter]

---DOCUMENT TEXT---
${documentText}
`

  const result = await model.generateContent(prompt)
  const response = result.response
  return response.text()
}
