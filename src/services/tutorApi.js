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

export async function getTutorStatus() {
  try {
    const response = await fetch('/api/health', {
      signal: AbortSignal.timeout(4_000),
    })
    const payload = await response.json()

    if (!response.ok || !payload.aiConfigured) {
      return {
        state: 'fallback',
        message: 'Saved questions are ready.',
      }
    }

    return {
      state: 'configured',
      model: payload.model,
      message: 'An AI key is configured. Availability is confirmed when a question is generated.',
    }
  } catch {
    return {
      state: 'fallback',
      message: 'Saved questions are ready.',
    }
  }
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
    const error = new Error(payload.message || 'A fresh question could not be generated.')
    error.code = payload.code || 'AI_REQUEST_FAILED'
    throw error
  }

  if (!isGeneratedQuestion(payload.question)) {
    throw new Error('The generated question was not usable.')
  }

  return payload.question
}
