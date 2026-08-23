import {
  generateQuestion,
  getConfiguredModel,
  isAiConfigured,
  QuestionRequestSchema,
} from './questionGenerator.js'

function parseRequestBody(body) {
  if (typeof body === 'string') {
    return JSON.parse(body)
  }

  if (Buffer.isBuffer(body)) {
    return JSON.parse(body.toString('utf8'))
  }

  return body
}

export function healthHandler(request, response) {
  if (request.method && request.method !== 'GET') {
    return response.status(405).json({
      code: 'METHOD_NOT_ALLOWED',
      message: 'Use GET for this endpoint.',
    })
  }

  return response.json({
    ok: true,
    aiConfigured: isAiConfigured(),
    model: getConfiguredModel(),
  })
}

export async function questionGenerationHandler(request, response) {
  if (request.method && request.method !== 'POST') {
    return response.status(405).json({
      code: 'METHOD_NOT_ALLOWED',
      message: 'Use POST for this endpoint.',
    })
  }

  let requestBody

  try {
    requestBody = parseRequestBody(request.body)
  } catch {
    return response.status(400).json({
      code: 'INVALID_JSON',
      message: 'The request body must contain valid JSON.',
    })
  }

  const parsedRequest = QuestionRequestSchema.safeParse(requestBody)

  if (!parsedRequest.success) {
    return response.status(400).json({
      code: 'INVALID_REQUEST',
      message: 'The question request was incomplete or invalid.',
    })
  }

  try {
    const question = await generateQuestion(parsedRequest.data)
    return response.json({ question })
  } catch (error) {
    if (error.code === 'AI_NOT_CONFIGURED') {
      return response.status(503).json({
        code: error.code,
        message: 'AI generation is not configured, so the app will use a saved question.',
      })
    }

    if (error.status === 429) {
      return response.status(503).json({
        code: error.code === 'insufficient_quota'
          ? 'AI_QUOTA_UNAVAILABLE'
          : 'AI_RATE_LIMITED',
        message: 'AI is temporarily unavailable, so the app will use a saved question.',
      })
    }

    console.error('Question generation failed', {
      name: error.name,
      status: error.status,
      code: error.code,
    })
    return response.status(502).json({
      code: 'AI_GENERATION_FAILED',
      message: 'A fresh question could not be generated, so the app will use a saved question.',
    })
  }
}
