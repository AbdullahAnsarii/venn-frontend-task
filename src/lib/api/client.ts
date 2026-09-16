import { z } from 'zod'

const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL
if (!baseUrl) {
  throw new Error('NEXT_PUBLIC_API_BASE_URL is not set')
}

export const API_BASE_URL = baseUrl

const REQUEST_TIMEOUT_MS = 10_000

const errorBody = z.object({ message: z.string() })

export class ApiError extends Error {
  readonly status: number

  constructor(status: number, message: string) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

type RequestOptions = {
  method?: 'GET' | 'POST'
  body?: unknown
  signal?: AbortSignal
}

export async function request(path: string, { method = 'GET', body, signal }: RequestOptions = {}) {
  const controller = new AbortController()
  const abort = () => controller.abort()
  // Set a timeout to abort the request after REQUEST_TIMEOUT_MS milliseconds
  const timer = setTimeout(abort, REQUEST_TIMEOUT_MS)
  if (signal?.aborted) {
    abort()
  }
  signal?.addEventListener('abort', abort, { once: true })

  try {
    return await fetch(`${API_BASE_URL}${path}`, {
      method,
      headers: body === undefined ? undefined : { 'Content-Type': 'application/json' },
      body: body === undefined ? undefined : JSON.stringify(body),
      signal: controller.signal,
    })
  } finally {
    clearTimeout(timer)
    signal?.removeEventListener('abort', abort)
  }
}

export async function errorFromResponse(response: Response) {
  // Attempt to parse the response body as JSON and validate it against the errorBody schema
  const parsed = errorBody.safeParse(await response.json().catch(() => null))
  const message = parsed.success
    ? parsed.data.message
    : `Request failed with status ${response.status}`
  return new ApiError(response.status, message)
}
