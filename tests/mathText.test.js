import test from 'node:test'
import assert from 'node:assert/strict'
import { parseMathText, renderMathMarkup } from '../src/utils/mathText.js'
import { allCourses } from '../src/data/curriculum.js'
import { demoProblems } from '../src/data/demoProblems.js'

test('parseMathText separates inline and display LaTeX from surrounding text', () => {
  assert.deepEqual(
    parseMathText('Solve \\(x^2 + 3x = 4\\), then show \\[x = 1\\].'),
    [
      { type: 'text', value: 'Solve ' },
      { type: 'math', value: 'x^2 + 3x = 4', displayMode: false },
      { type: 'text', value: ', then show ' },
      { type: 'math', value: 'x = 1', displayMode: true },
      { type: 'text', value: '.' },
    ],
  )
})

test('parseMathText supports dollar-delimited LaTeX while preserving currency ranges', () => {
  assert.deepEqual(parseMathText('Use $x^2$ here.'), [
    { type: 'text', value: 'Use ' },
    { type: 'math', value: 'x^2', displayMode: false },
    { type: 'text', value: ' here.' },
  ])

  assert.deepEqual(parseMathText('The price changes from $20 to $25.'), [
    { type: 'text', value: 'The price changes from $20 to $25.' },
  ])

  assert.deepEqual(parseMathText('Save between $500–$1,000.'), [
    { type: 'text', value: 'Save between $500–$1,000.' },
  ])
})

test('parseMathText leaves readable Unicode math unchanged', () => {
  const unicodeMath = 'Solve 2³ · 2ˣ = 2⁷, then evaluate √25.'
  assert.deepEqual(parseMathText(unicodeMath), [
    { type: 'text', value: unicodeMath },
  ])
})

test('renderMathMarkup creates accessible KaTeX and escapes untrusted input', () => {
  const markup = renderMathMarkup('\\frac{x+1}{2}')
  const untrustedMarkup = renderMathMarkup('\\text{<script>alert(1)</script>}')

  assert.match(markup, /class="katex"/)
  assert.match(markup, /<math/)
  assert.doesNotMatch(untrustedMarkup, /<script>/)
})

test('every seeded math problem contains renderable notation', () => {
  const mathCourses = allCourses.filter((course) => course.subject === 'Math')

  for (const course of mathCourses) {
    let renderedSegmentCount = 0

    for (const problem of demoProblems[course.id]) {
      const values = [
        problem.prompt,
        ...problem.hints,
        problem.explanation,
        ...(problem.choices?.map((choice) => choice.label) ?? []),
      ]
      const mathSegments = values.flatMap((value) => (
        parseMathText(value).filter((segment) => segment.type === 'math')
      ))
      renderedSegmentCount += mathSegments.length

      for (const segment of mathSegments) {
        const markup = renderMathMarkup(segment.value, segment.displayMode)
        assert.doesNotMatch(markup, /katex-error/, `${problem.id} contains invalid LaTeX`)
      }
    }

    assert.equal(renderedSegmentCount > 0, true, `${course.name} should exercise math rendering`)
  }
})
