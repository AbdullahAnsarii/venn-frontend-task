import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { delay, http, HttpResponse } from 'msw'
import { describe, expect, it, vi } from 'vitest'
import {
  corporationNumberUrl,
  profileDetailsUrl,
  server,
  VALID_CORPORATION_NUMBER,
} from '@/test/server'
import { PHONE_PREFIX } from '@/lib/phone'
import { Onboarding } from './Onboarding'

const validDetails = {
  firstName: 'Hello',
  lastName: 'World',
  phone: '+13062776103',
  corporationNumber: VALID_CORPORATION_NUMBER,
}

function renderOnboarding() {
  render(<Onboarding />)
  return {
    user: userEvent.setup(),
    firstName: screen.getByLabelText('First Name'),
    lastName: screen.getByLabelText('Last Name'),
    phone: screen.getByLabelText('Phone Number'),
    corporationNumber: screen.getByLabelText('Corporation Number'),
    submitButton: screen.getByRole('button', { name: /submit/i }),
  }
}

type Form = ReturnType<typeof renderOnboarding>

async function fillForm(form: Form, details = validDetails) {
  await form.user.type(form.firstName, details.firstName)
  await form.user.type(form.lastName, details.lastName)
  await form.user.type(form.phone, details.phone.replace(PHONE_PREFIX, ''))
  await form.user.type(form.corporationNumber, details.corporationNumber)
}

function trackLookups(respond: (number: string) => Response | Promise<Response>) {
  const lookups: string[] = []
  server.use(
    http.get(corporationNumberUrl, ({ params }) => {
      lookups.push(String(params.number))
      return respond(String(params.number))
    }),
  )
  return lookups
}

const invalidResponse = () =>
  HttpResponse.json({ valid: false, message: 'Invalid corporation number' }, { status: 404 })
const validResponse = (number: string) =>
  HttpResponse.json({ corporationNumber: number, valid: true })

describe('onboarding form', () => {
  it('shows required errors and focuses the first field on empty submit', async () => {
    const { user, firstName, submitButton } = renderOnboarding()

    await user.click(submitButton)

    expect(await screen.findByText('First name is required')).toBeInTheDocument()
    expect(screen.getByText('Last name is required')).toBeInTheDocument()
    expect(screen.getByText('Phone number is required')).toBeInTheDocument()
    expect(screen.getByText('Corporation number is required')).toBeInTheDocument()
    expect(firstName).toHaveFocus()
  })

  it('shows errors and focuses the first invalid field on submit', async () => {
    const form = renderOnboarding()

    await fillForm(form, { ...validDetails, phone: '306 277 6103', corporationNumber: '12' })
    await form.user.click(form.submitButton)

    expect(
      await screen.findByText(
        'Enter the number as +1 followed by 10 digits, with no spaces or dashes',
      ),
    ).toBeInTheDocument()
    expect(screen.getByText('Corporation number must be exactly 9 characters')).toBeInTheDocument()
    expect(form.phone).toHaveFocus()
  })

  it('validates names on blur', async () => {
    const { user, firstName, lastName } = renderOnboarding()

    await user.type(firstName, 'a'.repeat(51))
    await user.tab()
    expect(await screen.findByText('First name must be 50 characters or fewer')).toBeInTheDocument()
    expect(firstName).toHaveAttribute('aria-invalid', 'true')

    await user.type(lastName, ' ')
    await user.tab()
    expect(await screen.findByText('Last name is required')).toBeInTheDocument()

    await user.clear(firstName)
    await user.type(firstName, 'a'.repeat(50))
    await user.tab()
    await waitFor(() => expect(firstName).not.toHaveAttribute('aria-invalid'))
  })

  it('only accepts canadian numbers in +1 format', async () => {
    const { user, phone } = renderOnboarding()

    const attempt = async (value: string) => {
      await user.clear(phone)
      await user.type(phone, value)
      await user.tab()
    }

    expect(phone).toHaveValue('+1')

    await user.clear(phone)
    expect(phone).toHaveValue('+1')

    await attempt('306 277 6103')
    expect(
      await screen.findByText(
        'Enter the number as +1 followed by 10 digits, with no spaces or dashes',
      ),
    ).toBeInTheDocument()

    await attempt('2065550123')
    expect(await screen.findByText('Only Canadian phone numbers are accepted')).toBeInTheDocument()

    await attempt('3062776103')
    expect(phone).toHaveValue('+13062776103')
    await waitFor(() => expect(phone).not.toHaveAttribute('aria-invalid'))
  })

  it('checks the corporation number with the api once it has 9 characters', async () => {
    const lookups = trackLookups(async () => {
      await delay(50)
      return invalidResponse()
    })
    const { user, corporationNumber } = renderOnboarding()

    await user.type(corporationNumber, '12345')
    await user.tab()
    expect(
      await screen.findByText('Corporation number must be exactly 9 characters'),
    ).toBeInTheDocument()
    expect(lookups).toEqual([])

    await user.clear(corporationNumber)
    await user.type(corporationNumber, '000000000')
    await user.tab()
    expect(await screen.findByRole('status')).toHaveTextContent(/checking/i)
    expect(await screen.findByText('Invalid corporation number')).toBeInTheDocument()
    expect(screen.queryByRole('status')).not.toBeInTheDocument()
    expect(corporationNumber).toHaveAttribute('aria-invalid', 'true')
    expect(lookups).toEqual(['000000000'])
  })

  it('does not refetch a corporation number it already checked', async () => {
    const lookups = trackLookups(invalidResponse)
    const { user, corporationNumber } = renderOnboarding()

    await user.type(corporationNumber, '000000000')
    await user.tab()
    expect(await screen.findByText('Invalid corporation number')).toBeInTheDocument()

    await user.click(corporationNumber)
    await user.tab()
    expect(await screen.findByText('Invalid corporation number')).toBeInTheDocument()
    expect(lookups).toEqual(['000000000'])
  })

  it('ignores a stale lookup response', async () => {
    const lookups = trackLookups(async (number) => {
      if (number === '111111111') {
        await delay(300)
        return invalidResponse()
      }
      return validResponse(number)
    })
    const { user, corporationNumber } = renderOnboarding()

    await user.type(corporationNumber, '111111111')
    await user.tab()
    await user.clear(corporationNumber)
    await user.type(corporationNumber, '222222222')
    await user.tab()

    await waitFor(() => expect(lookups).toEqual(['111111111', '222222222']))
    await new Promise((resolve) => setTimeout(resolve, 400))
    expect(screen.queryByText('Invalid corporation number')).not.toBeInTheDocument()
    expect(corporationNumber).not.toHaveAttribute('aria-invalid')
  })

  it('shows an error when the lookup fails and retries on the next blur', async () => {
    server.use(http.get(corporationNumberUrl, () => HttpResponse.error()))
    const { user, corporationNumber } = renderOnboarding()

    await user.type(corporationNumber, VALID_CORPORATION_NUMBER)
    await user.tab()
    expect(
      await screen.findByText("We couldn't verify the corporation number. Please try again."),
    ).toBeInTheDocument()

    const lookups = trackLookups(validResponse)
    await user.click(corporationNumber)
    await user.tab()
    await waitFor(() => expect(lookups).toEqual([VALID_CORPORATION_NUMBER]))
    await waitFor(() => expect(corporationNumber).not.toHaveAttribute('aria-invalid'))
  })

  it('treats an unexpected lookup response as a failed check', async () => {
    server.use(http.get(corporationNumberUrl, () => HttpResponse.json({ ok: true })))
    const { user, corporationNumber } = renderOnboarding()

    await user.type(corporationNumber, VALID_CORPORATION_NUMBER)
    await user.tab()

    expect(
      await screen.findByText("We couldn't verify the corporation number. Please try again."),
    ).toBeInTheDocument()
  })

  it('submits and moves on to step 2', async () => {
    const lookups = trackLookups(validResponse)
    let submitted: unknown
    server.use(
      http.post(profileDetailsUrl, async ({ request }) => {
        submitted = await request.json()
        await delay(150)
        return new HttpResponse('OK')
      }),
    )
    const form = renderOnboarding()

    await fillForm(form)
    await form.user.click(form.submitButton)

    await waitFor(() => expect(form.submitButton).toBeDisabled())
    expect(await screen.findByText('Step 2 of 5')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Profile saved' })).toHaveFocus()
    expect(submitted).toEqual(validDetails)
    expect(lookups).toEqual([VALID_CORPORATION_NUMBER])
  })

  it('shows a 400 message under the matching field', async () => {
    server.use(
      http.post(profileDetailsUrl, () =>
        HttpResponse.json({ message: 'Invalid phone number' }, { status: 400 }),
      ),
    )
    const form = renderOnboarding()

    await fillForm(form)
    await form.user.click(form.submitButton)

    expect(await screen.findByText('Invalid phone number')).toBeInTheDocument()
    expect(form.phone).toHaveAttribute('aria-invalid', 'true')
    expect(form.phone).toHaveAccessibleDescription('Invalid phone number')
    expect(form.phone).toHaveFocus()
    expect(screen.getByText('Step 1 of 5')).toBeInTheDocument()
    expect(form.submitButton).toBeEnabled()
  })

  it('shows other 400 messages above the button', async () => {
    server.use(
      http.post(profileDetailsUrl, () =>
        HttpResponse.json({ message: 'Missing required fields' }, { status: 400 }),
      ),
    )
    const form = renderOnboarding()

    await fillForm(form)
    await form.user.click(form.submitButton)

    expect(await screen.findByRole('alert')).toHaveTextContent('Missing required fields')
    expect(form.phone).not.toHaveAttribute('aria-invalid')
  })

  it('does not submit with an invalid corporation number', async () => {
    const submit = vi.fn()
    server.use(
      http.post(profileDetailsUrl, () => {
        submit()
        return new HttpResponse('OK')
      }),
    )
    const form = renderOnboarding()

    await fillForm(form, { ...validDetails, corporationNumber: '000000000' })
    await form.user.click(form.submitButton)

    expect(await screen.findByText('Invalid corporation number')).toBeInTheDocument()
    expect(form.corporationNumber).toHaveFocus()
    expect(submit).not.toHaveBeenCalled()
  })
})
