import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { ApiError } from '@/lib/api/client'
import { submitProfileDetails } from '@/lib/api/profileDetails'
import { onboardingSchema, type OnboardingValues } from './onboardingSchema'
import { useCorporationNumberValidation } from './useCorporationNumberValidation'

const defaultValues: OnboardingValues = {
  firstName: '',
  lastName: '',
  phone: '',
  corporationNumber: '',
}

const CORPORATION_NUMBER_UNAVAILABLE =
  "We couldn't verify the corporation number. Please try again."
const SUBMIT_FAILED = 'Something went wrong while submitting. Please try again.'

const apiMessageFields: Array<[RegExp, keyof OnboardingValues]> = [
  [/first name/i, 'firstName'],
  [/last name/i, 'lastName'],
  [/phone/i, 'phone'],
  [/corporation/i, 'corporationNumber'],
]

function fieldForApiMessage(message: string) {
  return apiMessageFields.find(([pattern]) => pattern.test(message))?.[1]
}

type Options = {
  onSubmitted: () => void
}

export function useOnboardingForm({ onSubmitted }: Options) {
  const { register, handleSubmit, trigger, getValues, setError, formState } =
    useForm<OnboardingValues>({
      resolver: zodResolver(onboardingSchema),
      defaultValues,
      mode: 'onBlur',
      reValidateMode: 'onBlur',
    })
  const corporationNumber = useCorporationNumberValidation()
  const [formError, setFormError] = useState<string | null>(null)

  const verifyCorporationNumber = async ({ focus = false } = {}) => {
    const number = getValues('corporationNumber')
    const check = await corporationNumber.validate(number)
    if (check.status === 'superseded' || getValues('corporationNumber') !== number) {
      return false
    }
    if (check.status === 'valid') {
      return true
    }
    setError(
      'corporationNumber',
      {
        type: 'server',
        message: check.status === 'invalid' ? check.message : CORPORATION_NUMBER_UNAVAILABLE,
      },
      { shouldFocus: focus },
    )
    return false
  }

  const handleCorporationNumberBlur = async () => {
    if (await trigger('corporationNumber')) {
      await verifyCorporationNumber()
    }
  }

  const submit = handleSubmit(async (values) => {
    setFormError(null)
    if (!(await verifyCorporationNumber({ focus: true }))) {
      return
    }
    try {
      await submitProfileDetails(values)
      onSubmitted()
    } catch (error) {
      const message = error instanceof ApiError ? error.message : SUBMIT_FAILED
      const field =
        error instanceof ApiError && error.status === 400 ? fieldForApiMessage(message) : undefined
      if (field) {
        setError(field, { type: 'server', message }, { shouldFocus: true })
      } else {
        setFormError(message)
      }
    }
  })

  return {
    fields: {
      firstName: register('firstName'),
      lastName: register('lastName'),
      phone: register('phone'),
      corporationNumber: register('corporationNumber', { onBlur: handleCorporationNumberBlur }),
    },
    errors: formState.errors,
    isSubmitting: formState.isSubmitting,
    isCheckingCorporationNumber: corporationNumber.isChecking,
    formError,
    submit,
  }
}
