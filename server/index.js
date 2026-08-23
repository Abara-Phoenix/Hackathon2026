import 'dotenv/config'
import express from 'express'
import { existsSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  healthHandler,
  questionGenerationHandler,
} from './apiHandlers.js'
import {
  getConfiguredModel,
  isAiConfigured,
} from './questionGenerator.js'

const app = express()
const port = Number(process.env.PORT) || 8787
const serverDirectory = path.dirname(fileURLToPath(import.meta.url))
const distDirectory = path.resolve(serverDirectory, '../dist')

app.disable('x-powered-by')
app.use(express.json({ limit: '20kb' }))

app.get('/api/health', healthHandler)
app.post('/api/questions/generate', questionGenerationHandler)

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
