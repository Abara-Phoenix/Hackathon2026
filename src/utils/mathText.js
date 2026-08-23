import katex from 'katex'

const DELIMITED_MATH_PATTERN = /(\\\[[\s\S]*?\\\]|\\\([\s\S]*?\\\)|\$\$[\s\S]*?\$\$|(?<!\\)\$(?!\$)[^$\n]+?(?<!\\)\$(?!\$))/g

function appendText(segments, value) {
  if (!value) {
    return
  }

  const previousSegment = segments.at(-1)
  if (previousSegment?.type === 'text') {
    previousSegment.value += value
    return
  }

  segments.push({ type: 'text', value })
}

function parseDelimitedMath(value) {
  if (value.startsWith('\\[')) {
    return { displayMode: true, value: value.slice(2, -2) }
  }

  if (value.startsWith('\\(')) {
    return { displayMode: false, value: value.slice(2, -2) }
  }

  if (value.startsWith('$$')) {
    return { displayMode: true, value: value.slice(2, -2) }
  }

  return { displayMode: false, value: value.slice(1, -1) }
}

function isSupportedSingleDollarMath(value) {
  if (value.trim() !== value) {
    return false
  }

  if (/^\d[\d,.]*(?:\s+(?:to|and)\s*|[-–—])/i.test(value)) {
    return false
  }

  return /[A-Za-z\\_^{}=+*/<>≤≥∫√πθ]/.test(value)
}

export function parseMathText(value) {
  if (typeof value !== 'string' || value.length === 0) {
    return []
  }

  const segments = []
  let cursor = 0

  for (const match of value.matchAll(DELIMITED_MATH_PATTERN)) {
    appendText(segments, value.slice(cursor, match.index))

    const rawValue = match[0]
    const math = parseDelimitedMath(rawValue)
    const isSingleDollar = rawValue.startsWith('$') && !rawValue.startsWith('$$')

    // Preserve likely currency ranges such as "$20 to $25" as ordinary text.
    if (!math.value.trim() || (isSingleDollar && !isSupportedSingleDollarMath(math.value))) {
      appendText(segments, rawValue)
    } else {
      segments.push({
        type: 'math',
        value: math.value,
        displayMode: math.displayMode,
      })
    }

    cursor = match.index + rawValue.length
  }

  appendText(segments, value.slice(cursor))
  return segments
}

export function renderMathMarkup(value, displayMode = false) {
  return katex.renderToString(value, {
    displayMode,
    output: 'htmlAndMathml',
    throwOnError: false,
    strict: 'warn',
    trust: false,
  })
}
