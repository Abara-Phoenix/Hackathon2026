import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import process from 'node:process'
import healthFunction from '../api/health.js'
import questionFunction from '../api/questions/generate.js'
import {
  healthHandler,
  questionGenerationHandler,
} from '../server/apiHandlers.js'

const validRequest = {
  course: { id: 'biology', name: 'Biology', subject: 'Science' },
  skill: {
    id: 'cell-structure',
    name: 'Cell structure',
    goal: 'Connect organelles to the jobs cells perform.',
  },
  answerType: 'multiple-choice',
  promptStyle: 'standard',
  language: null,
  difficulty: 'Warm-up',
  recentMistakes: [],
  avoidPrompts: [],
}

function createResponse() {
  return {
    statusCode: 200,
    payload: null,
    status(statusCode) {
      this.statusCode = statusCode
      return this
    },
    json(payload) {
      this.payload = payload
      return this
    },
  }
}

function restoreEnvironment(name, previousValue) {
  if (previousValue === undefined) {
    delete process.env[name]
  } else {
    process.env[name] = previousValue
  }
}

test('Vercel functions reuse the same handlers as local Express', () => {
  assert.equal(healthFunction, healthHandler)
  assert.equal(questionFunction, questionGenerationHandler)
})

test('the Vercel health function reports server-side AI configuration', () => {
  const previousKey = process.env.OPENAI_API_KEY
  const previousModel = process.env.OPENAI_MODEL
  process.env.OPENAI_API_KEY = 'replace-with-your-openai-api-key'
  process.env.OPENAI_MODEL = 'gpt-5.6-luna'

  try {
    const response = createResponse()
    healthFunction({ method: 'GET' }, response)

    assert.equal(response.statusCode, 200)
    assert.deepEqual(response.payload, {
      ok: true,
      aiConfigured: false,
      model: 'gpt-5.6-luna',
    })
  } finally {
    restoreEnvironment('OPENAI_API_KEY', previousKey)
    restoreEnvironment('OPENAI_MODEL', previousModel)
  }
})

test('the Vercel generation function rejects invalid JSON safely', async () => {
  const response = createResponse()
  await questionFunction({ method: 'POST', body: '{not valid JSON' }, response)

  assert.equal(response.statusCode, 400)
  assert.equal(response.payload.code, 'INVALID_JSON')
})

test('the Vercel generation function uses the seeded fallback contract without a key', async () => {
  const previousKey = process.env.OPENAI_API_KEY
  process.env.OPENAI_API_KEY = 'replace-with-your-openai-api-key'

  try {
    const response = createResponse()
    await questionFunction(
      { method: 'POST', body: JSON.stringify(validRequest) },
      response,
    )

    assert.equal(response.statusCode, 503)
    assert.equal(response.payload.code, 'AI_NOT_CONFIGURED')
  } finally {
    restoreEnvironment('OPENAI_API_KEY', previousKey)
  }
})

test('Vercel allows enough time for the bounded OpenAI request', () => {
  const config = JSON.parse(
    readFileSync(new URL('../vercel.json', import.meta.url), 'utf8'),
  )

  assert.equal(config.framework, 'vite')
  assert.equal(config.functions['api/questions/generate.js'].maxDuration, 30)
})
