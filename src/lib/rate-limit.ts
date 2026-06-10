import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

let limiter: Ratelimit | null = null

function getLimiter() {
  if (limiter) return limiter
  const url = process.env.UPSTASH_REDIS_REST_URL
  const token = process.env.UPSTASH_REDIS_REST_TOKEN
  if (!url || !token) return null
  limiter = new Ratelimit({
    redis: new Redis({ url, token }),
    limiter: Ratelimit.slidingWindow(10, '60 s'),
    analytics: false,
  })
  return limiter
}

export async function rateLimit(identifier: string): Promise<{ success: boolean; remaining: number }> {
  const rl = getLimiter()
  if (!rl) return { success: true, remaining: 99 }
  const result = await rl.limit(identifier)
  return { success: result.success, remaining: result.remaining }
}
