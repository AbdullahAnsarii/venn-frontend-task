import { errorFromResponse, request } from './client'

export type CorporationNumberResult =
  { valid: true; corporationNumber: string } | { valid: false; message: string }

export async function checkCorporationNumber(number: string): Promise<CorporationNumberResult> {
  const response = await request(`/corporation-number/${encodeURIComponent(number)}`)
  if (response.ok || response.status === 404) {
    return response.json()
  }
  throw await errorFromResponse(response)
}
