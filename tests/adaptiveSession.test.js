import test from 'node:test'
import assert from 'node:assert/strict'
import {
  chooseInitialProblem,
  createFallbackProblem,
  randomProblemIndex,
  selectAdaptiveTarget,
  SESSION_LENGTH,
} from '../src/utils/adaptiveSession.js'

const course = {
  skills: [
    { id: 'linear', name: 'Linear equations', goal: 'Solve linear equations.' },
    { id: 'systems', name: 'Systems', goal: 'Solve systems of equations.' },
    { id: 'quadratics', name: 'Quadratics', goal: 'Solve quadratic equations.' },
  ],
}

const currentProblem = {
  id: 'linear-1',
  skillId: 'linear',
  difficulty: 'Steady',
  prompt: 'Solve 2x = 8.',
}

test('adaptive sessions run longer than the old three-question demos', () => {
  assert.equal(SESSION_LENGTH, 10)
})

test('a strong streak advances the skill and raises the difficulty', () => {
  const target = selectAdaptiveTarget({
    course,
    currentProblem,
    outcome: 'correct',
    streak: 2,
    completedSkillIds: ['linear'],
    questionNumber: 2,
  })

  assert.equal(target.skill.id, 'systems')
  assert.equal(target.difficulty, 'Stretch')
  assert.match(target.reason, /raises the challenge/i)
})

test('hints, retries, and skips keep the skill at a supportive level', () => {
  const retryTarget = selectAdaptiveTarget({
    course,
    currentProblem,
    outcome: 'correct',
    misses: 1,
    hintsUsed: 1,
  })
  const skipTarget = selectAdaptiveTarget({
    course,
    currentProblem,
    outcome: 'skipped',
  })

  assert.equal(retryTarget.skill.id, 'linear')
  assert.equal(retryTarget.difficulty, 'Steady')
  assert.equal(skipTarget.skill.id, 'linear')
  assert.equal(skipTarget.difficulty, 'Warm-up')
})

test('saved fallbacks avoid immediately repeating the previous prompt', () => {
  const seededProblems = [
    { ...currentProblem, choices: [{ id: 'a', label: '4' }, { id: 'b', label: '8' }] },
    {
      id: 'systems-1',
      skillId: 'systems',
      difficulty: 'Steady',
      prompt: 'Which ordered pair solves the system?',
      choices: [{ id: 'a', label: '(1, 2)' }, { id: 'b', label: '(2, 1)' }],
    },
  ]
  const fallback = createFallbackProblem({
    seededProblems,
    target: { skill: course.skills[0] },
    usedProblems: [currentProblem],
    questionNumber: 2,
  })

  assert.notEqual(fallback.prompt, currentProblem.prompt)
  assert.equal(fallback.source, 'seeded')
})

test('the initial saved question can start from any requested position', () => {
  const problems = [
    { id: 'one', prompt: 'First question' },
    { id: 'two', prompt: 'Second question' },
    { id: 'three', prompt: 'Third question' },
  ]

  assert.equal(chooseInitialProblem(problems, 1).prompt, 'Second question')
  assert.equal(chooseInitialProblem(problems, 4).prompt, 'Second question')
})

test('a brand-new session does not default to the canonical first seed', () => {
  assert.equal(randomProblemIndex(2), 1)
  assert.equal(randomProblemIndex(5) > 0, true)
})
