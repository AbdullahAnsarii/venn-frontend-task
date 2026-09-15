import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { delay, http, HttpResponse } from 'msw'
import { describe, expect, it, vi } from 'vitest'
import { profileDetailsUrl, server, VALID_CORPORATION_NUMBER } from '@/test/server'
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
  await form.user.type(form.phone, details.phone)
  await form.user.type(form.corporationNumber, details.corporationNumber)
}

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

    await attempt('3062776103')
    expect(
      await screen.findByText(
        'Enter the number as +1 followed by 10 digits, with no spaces or dashes',
      ),
    ).toBeInTheDocument()

    await attempt('+1 306 277 6103')
    expect(
      await screen.findByText(
        'Enter the number as +1 followed by 10 digits, with no spaces or dashes',
      ),
    ).toBeInTheDocument()

    await attempt('+12065550123')
    expect(await screen.findByText('Only Canadian phone numbers are accepted')).toBeInTheDocument()

    await attempt('+13062776103')
    await waitFor(() => expect(phone).not.toHaveAttribute('aria-invalid'))
  })

  it('submits and moves on to step 2', async () => {
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
