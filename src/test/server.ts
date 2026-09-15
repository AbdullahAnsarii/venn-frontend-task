import { http, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import { API_BASE_URL } from '@/lib/api/client'

export const VALID_CORPORATION_NUMBER = '826417395'

export const corporationNumberUrl = `${API_BASE_URL}/corporation-number/:number`
export const profileDetailsUrl = `${API_BASE_URL}/profile-details`

export const handlers = [
  http.get(corporationNumberUrl, ({ params }) => {
    if (params.number === VALID_CORPORATION_NUMBER) {
      return HttpResponse.json({ corporationNumber: params.number, valid: true })
    }
    return HttpResponse.json(
      { valid: false, message: 'Invalid corporation number' },
      { status: 404 },
    )
  }),
  http.post(profileDetailsUrl, () => new HttpResponse('OK')),
]

export const server = setupServer(...handlers)
