import test from 'node:test'
import assert from 'node:assert/strict'
import {
  formatGeneratedQuestion,
  isPromptTooSimilar,
  QuestionRequestSchema,
} from '../server/questionGenerator.js'

const baseRequest = {
  skill: {
    id: 'cell-structure',
    name: 'Cell structure',
    goal: 'Connect organelles to the jobs cells perform.',
  },
  promptStyle: 'standard',
  language: null,
  difficulty: 'Warm-up',
  recentMistakes: [],
  avoidPrompts: [],
}

test('the generation API accepts a Biology multiple-choice request', () => {
  const result = QuestionRequestSchema.safeParse({
    ...baseRequest,
    course: { id: 'biology', name: 'Biology', subject: 'Science' },
    answerType: 'multiple-choice',
  })

  assert.equal(result.success, true)
})

test('the generation API still accepts numeric Math requests', () => {
  const result = QuestionRequestSchema.safeParse({
    ...baseRequest,
    course: { id: 'algebra-1', name: 'Algebra 1', subject: 'Math' },
    answerType: 'numeric',
  })

  assert.equal(result.success, true)
})

test('the generation API rejects unsupported answer formats', () => {
  const result = QuestionRequestSchema.safeParse({
    ...baseRequest,
    course: { id: 'biology', name: 'Biology', subject: 'Science' },
    answerType: 'essay',
  })

  assert.equal(result.success, false)
})

test('the generation API accepts Python code questions', () => {
  const result = QuestionRequestSchema.safeParse({
    ...baseRequest,
    course: {
      id: 'python-foundations',
      name: 'Python Foundations',
      subject: 'Computer Science',
    },
    answerType: 'multiple-choice',
    promptStyle: 'code',
    language: 'Python',
  })

  assert.equal(result.success, true)
})

test('a generated Biology response is normalized for the practice UI', () => {
  const question = formatGeneratedQuestion(
    {
      ...baseRequest,
      course: { id: 'biology', name: 'Biology', subject: 'Science' },
      answerType: 'multiple-choice',
    },
    {
      prompt: 'Which organelle produces most ATP in a eukaryotic cell?',
      codeSnippet: null,
      choices: ['Nucleus', 'Mitochondrion', 'Ribosome', 'Golgi apparatus'],
      answerIndex: 1,
      hints: ['Think about cellular respiration.', 'Look for the folded inner membrane.'],
      explanation: 'Mitochondria carry out the later stages of cellular respiration.',
    },
  )

  assert.equal(question.answerType, 'multiple-choice')
  assert.equal(question.answer, 'choice-1')
  assert.equal(question.choices[1].label, 'Mitochondrion')
  assert.equal(Object.hasOwn(question, 'answerIndex'), false)
})

test('a generated Python response keeps its code snippet', () => {
  const question = formatGeneratedQuestion(
    {
      ...baseRequest,
      answerType: 'multiple-choice',
      promptStyle: 'code',
      language: 'Python',
    },
    {
      prompt: 'What does this Python program print?',
      codeSnippet: 'value = 2\nprint(value * 3)',
      choices: ['2', '3', '5', '6'],
      answerIndex: 3,
      hints: ['Trace the assignment first.', 'Multiply the stored value by three.'],
      explanation: 'The variable stores 2, and 2 multiplied by 3 is 6.',
    },
  )

  assert.equal(question.codeSnippet, 'value = 2\nprint(value * 3)')
  assert.equal(question.answer, 'choice-3')
})

test('generated Biology choices must be unique', () => {
  assert.throws(() => formatGeneratedQuestion(
    {
      ...baseRequest,
      answerType: 'multiple-choice',
    },
    {
      prompt: 'Which choice is correct for this science question?',
      choices: ['Same', 'Same', 'Third', 'Fourth'],
      answerIndex: 0,
      hints: ['Use the lesson concept.', 'Compare each choice carefully.'],
      explanation: 'The correct choice follows from the lesson concept.',
    },
  ), /duplicate answer choices/)
})

test('generation rejects repeated templates even when only the numbers change', () => {
  assert.equal(
    isPromptTooSimilar('Solve for x: 5(x - 4) = 20.', ['Solve for x: 3(x - 2) = 12.']),
    true,
  )
  assert.equal(
    isPromptTooSimilar(
      'A graph crosses the x-axis twice. How many real zeros does the function have?',
      ['Solve for x: 3(x - 2) = 12.'],
    ),
    false,
  )
})

test('generation accepts a longer recent-prompt history and adaptive context', () => {
  const result = QuestionRequestSchema.safeParse({
    ...baseRequest,
    course: { id: 'algebra-1', name: 'Algebra 1', subject: 'Math' },
    answerType: 'numeric',
    avoidPrompts: Array.from({ length: 12 }, (_, index) => `Previous prompt ${index}`),
    questionApproach: 'a realistic scenario that requires modeling',
    variationSeed: 'session-4-question-7',
    performance: { misses: 1, hintsUsed: 1, streak: 0 },
  })

  assert.equal(result.success, true)
})
