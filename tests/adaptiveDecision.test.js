import test from 'node:test'
import assert from 'node:assert/strict'
import { buildAdaptiveDecision } from '../src/utils/adaptiveDecision.js'

const baseContext = {
  currentSkillName: 'Linear equations',
  nextSkillName: 'Systems of equations',
  currentDifficulty: 'Warm-up',
  nextDifficulty: 'Steady',
}

test('a missed answer keeps the student on the current skill', () => {
  const decision = buildAdaptiveDecision({
    ...baseContext,
    correct: false,
    isLastProblem: false,
    misses: 1,
    hintsUsed: 0,
  })

  assert.equal(decision.tone, 'review')
  assert.equal(decision.title, 'Stay on Linear equations')
  assert.equal(decision.evidence, '1 missed attempt • Hint support available')
  assert.equal(decision.routeFrom, decision.routeTo)
})

test('a correct answer advances the skill and difficulty', () => {
  const decision = buildAdaptiveDecision({
    ...baseContext,
    correct: true,
    isLastProblem: false,
    misses: 1,
    hintsUsed: 1,
  })

  assert.equal(decision.tone, 'advance')
  assert.equal(decision.title, 'Advance to Systems of equations')
  assert.equal(decision.evidence, 'Correct after 1 retry • 1 hint revealed')
  assert.equal(decision.routeTo, 'Steady')
})

test('the final correct answer routes to the session summary', () => {
  const decision = buildAdaptiveDecision({
    ...baseContext,
    correct: true,
    isLastProblem: true,
  })

  assert.equal(decision.tone, 'complete')
  assert.equal(decision.title, 'Save Linear equations mastery')
  assert.equal(decision.routeTo, 'Session summary')
})
