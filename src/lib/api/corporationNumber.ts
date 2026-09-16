import { z } from 'zod'
import { errorFromResponse, request } from './client'

const corporationNumberResult = z.discriminatedUnion('valid', [
  z.object({ valid: z.literal(true), corporationNumber: z.string() }),
  z.object({ valid: z.literal(false), message: z.string() }),
])

export type CorporationNumberResult = z.infer<typeof corporationNumberResult>

export async function checkCorporationNumber(
  number: string,
  signal?: AbortSignal,
): Promise<CorporationNumberResult> {
  // Encode the corporation number to ensure it is safe for use in a URL
  const response = await request(`/corporation-number/${encodeURIComponent(number)}`, { signal })
  if (response.ok || response.status === 404) {
    return corporationNumberResult.parse(await response.json())
  }
  throw await errorFromResponse(response)
}
