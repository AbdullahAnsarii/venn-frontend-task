export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? 'https://fe-hometask-api.qa.vault.tryvault.com'

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
}

export function request(path: string, { method = 'GET', body }: RequestOptions = {}) {
  return fetch(`${API_BASE_URL}${path}`, {
    method,
    headers: body === undefined ? undefined : { 'Content-Type': 'application/json' },
    body: body === undefined ? undefined : JSON.stringify(body),
  })
}

export async function errorFromResponse(response: Response) {
  const data = (await response.json().catch(() => null)) as { message?: unknown } | null
  const message =
    typeof data?.message === 'string'
      ? data.message
      : `Request failed with status ${response.status}`
  return new ApiError(response.status, message)
}
