import test from 'node:test'
import assert from 'node:assert/strict'
import {
  isAnswerCorrect,
  isPracticeAnswerCorrect,
  parseNumericAnswer,
} from '../src/utils/answerChecking.js'

test('parseNumericAnswer accepts the formats used by the practice UI', () => {
  assert.equal(parseNumericAnswer('x = 6'), 6)
  assert.equal(parseNumericAnswer(' 3 / 4 '), 0.75)
  assert.equal(parseNumericAnswer('−2.5'), -2.5)
  assert.equal(parseNumericAnswer('1,250'), 1250)
  assert.equal(parseNumericAnswer('70°'), 70)
})

test('parseNumericAnswer rejects unusable or unsafe values', () => {
  assert.equal(parseNumericAnswer(''), null)
  assert.equal(parseNumericAnswer('not a number'), null)
  assert.equal(parseNumericAnswer('1 / 0'), null)
  assert.equal(parseNumericAnswer(Number.POSITIVE_INFINITY), null)
  assert.equal(parseNumericAnswer({ answer: 6 }), null)
})

test('isAnswerCorrect respects exact values and generated-question tolerance', () => {
  assert.equal(isAnswerCorrect('x = 6', 6), true)
  assert.equal(isAnswerCorrect('2/3', 2 / 3), true)
  assert.equal(isAnswerCorrect('3.141', 3.14, 0.002), true)
  assert.equal(isAnswerCorrect('3.15', 3.14, 0.002), false)
  assert.equal(isAnswerCorrect('nope', 6), false)
})

test('isPracticeAnswerCorrect supports multiple-choice questions', () => {
  const problem = {
    answerType: 'multiple-choice',
    answer: 'mitochondrion',
  }

  assert.equal(isPracticeAnswerCorrect('mitochondrion', problem), true)
  assert.equal(isPracticeAnswerCorrect('nucleus', problem), false)
  assert.equal(isPracticeAnswerCorrect('', problem), false)
})
