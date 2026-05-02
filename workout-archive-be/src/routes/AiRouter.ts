import { Router } from 'express'
import { createAIEngine } from '@aiglue/core'
import type { Request } from 'express'
import { workoutTools }      from '../tools/workout-tools'
import { commentTools }      from '../tools/comment-tools'
import { searchTools }       from '../tools/search-tools'
import { followTools }       from '../tools/follow-tools'
import { userTools }         from '../tools/user-tools'
import { feedTools }         from '../tools/feed-tools'
import { statisticsTools }   from '../tools/statistics-tools'
import { notificationTools } from '../tools/notification-tools'

const aiRouter = Router()

const engine = createAIEngine({
  tools: [
    ...workoutTools, ...commentTools, ...searchTools,
    ...followTools,  ...userTools,    ...feedTools,
    ...statisticsTools, ...notificationTools,
  ],
  llm: {
    provider: 'openai-compatible',
    apiKey: process.env.GROQ_API_KEY,
    model: 'meta-llama/llama-4-scout-17b-16e-instruct',
    baseUrl: 'https://api.groq.com/openai/v1',
  },
  baseUrl: `http://localhost:${process.env.PORT ?? 3000}`,
  auth: {
    type: 'bearer',
    token: (req) => (req as Request).cookies?.auth_token,
  },
})

aiRouter.post('/chat', engine.handler())

export default aiRouter
