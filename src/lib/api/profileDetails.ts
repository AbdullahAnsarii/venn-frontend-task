import { errorFromResponse, request } from './client'

export type ProfileDetails = {
  firstName: string
  lastName: string
  corporationNumber: string
  phone: string
}

export async function submitProfileDetails(details: ProfileDetails): Promise<void> {
  const response = await request('/profile-details', { method: 'POST', body: details })
  if (!response.ok) {
    throw await errorFromResponse(response)
  }
}
