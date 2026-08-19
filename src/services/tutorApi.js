function isGeneratedQuestion(question) {
  return (
    question &&
    typeof question.id === 'string' &&
    typeof question.prompt === 'string' &&
    typeof question.answer === 'number' &&
    typeof question.tolerance === 'number' &&
    Array.isArray(question.hints) &&
    question.hints.length === 2 &&
    typeof question.explanation === 'string'
  )
}

export async function generateQuestion(context) {
  const response = await fetch('/api/questions/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(context),
    signal: AbortSignal.timeout(22_000),
  })

  const payload = await response.json().catch(() => ({}))

  if (!response.ok) {
    throw new Error(payload.message || 'A fresh question could not be generated.')
  }

  if (!isGeneratedQuestion(payload.question)) {
    throw new Error('The generated question was not usable.')
  }

  return payload.question
}
