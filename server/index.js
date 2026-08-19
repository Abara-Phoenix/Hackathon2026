import 'dotenv/config'
import express from 'express'
import { existsSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  generateMathQuestion,
  getConfiguredModel,
  isAiConfigured,
  QuestionRequestSchema,
} from './questionGenerator.js'

const app = express()
const port = Number(process.env.PORT) || 8787
const serverDirectory = path.dirname(fileURLToPath(import.meta.url))
const distDirectory = path.resolve(serverDirectory, '../dist')

app.disable('x-powered-by')
app.use(express.json({ limit: '20kb' }))

app.get('/api/health', (request, response) => {
  void request
  response.json({
    ok: true,
    aiConfigured: isAiConfigured(),
    model: getConfiguredModel(),
  })
})

app.post('/api/questions/generate', async (request, response) => {
  const parsedRequest = QuestionRequestSchema.safeParse(request.body)

  if (!parsedRequest.success) {
    response.status(400).json({
      code: 'INVALID_REQUEST',
      message: 'The question request was incomplete or invalid.',
    })
    return
  }

  try {
    const question = await generateMathQuestion(parsedRequest.data)
    response.json({ question })
  } catch (error) {
    if (error.code === 'AI_NOT_CONFIGURED') {
      response.status(503).json({
        code: error.code,
        message: 'AI generation is not configured, so the app will use a saved question.',
      })
      return
    }

    if (error.status === 429) {
      response.status(503).json({
        code: error.code === 'insufficient_quota'
          ? 'AI_QUOTA_UNAVAILABLE'
          : 'AI_RATE_LIMITED',
        message: 'AI is temporarily unavailable, so the app will use a saved question.',
      })
      return
    }

    console.error('Question generation failed', {
      name: error.name,
      status: error.status,
      code: error.code,
    })
    response.status(502).json({
      code: 'AI_GENERATION_FAILED',
      message: 'A fresh question could not be generated, so the app will use a saved question.',
    })
  }
})

if (process.env.NODE_ENV === 'production' && existsSync(distDirectory)) {
  app.use(express.static(distDirectory))
  app.get(/^(?!\/api).*/, (request, response) => {
    void request
    response.sendFile(path.join(distDirectory, 'index.html'))
  })
}

app.use((error, request, response, next) => {
  void request
  void next

  if (error instanceof SyntaxError) {
    response.status(400).json({
      code: 'INVALID_JSON',
      message: 'The request body must contain valid JSON.',
    })
    return
  }

  console.error('Unexpected API error', { name: error.name })
  response.status(500).json({ code: 'INTERNAL_ERROR', message: 'Something went wrong.' })
})

app.listen(port, () => {
  console.log(`SolvePath API listening on http://localhost:${port}`)
  console.log(isAiConfigured() ? `AI enabled with ${getConfiguredModel()}` : 'AI key missing; seeded fallback enabled')
})
