export function parseNumericAnswer(rawAnswer) {
  if (typeof rawAnswer === 'number') {
    return Number.isFinite(rawAnswer) ? rawAnswer : null
  }

  if (typeof rawAnswer !== 'string') {
    return null
  }

  let value = rawAnswer
    .trim()
    .replaceAll(',', '')
    .replaceAll('−', '-')
    .replace(/[°$%]/g, '')

  if (value.includes('=')) {
    value = value.split('=').at(-1).trim()
  }

  if (!value) {
    return null
  }

  const fractionMatch = value.match(/^(-?\d+(?:\.\d+)?)\s*\/\s*(-?\d+(?:\.\d+)?)$/)
  if (fractionMatch) {
    const numerator = Number(fractionMatch[1])
    const denominator = Number(fractionMatch[2])
    return denominator === 0 ? null : numerator / denominator
  }

  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : null
}

export function isAnswerCorrect(rawAnswer, expectedAnswer, tolerance = 0.01) {
  const parsedAnswer = parseNumericAnswer(rawAnswer)
  return parsedAnswer !== null && Math.abs(parsedAnswer - expectedAnswer) <= tolerance
}
