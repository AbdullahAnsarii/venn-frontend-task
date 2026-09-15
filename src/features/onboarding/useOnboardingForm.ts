import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { ApiError } from '@/lib/api/client'
import { submitProfileDetails } from '@/lib/api/profileDetails'
import { onboardingSchema, type OnboardingValues } from './onboardingSchema'

const defaultValues: OnboardingValues = {
  firstName: '',
  lastName: '',
  phone: '',
  corporationNumber: '',
}

const SUBMIT_FAILED = 'Something went wrong while submitting. Please try again.'

type Options = {
  onSubmitted: () => void
}

export function useOnboardingForm({ onSubmitted }: Options) {
  const { register, handleSubmit, formState } = useForm<OnboardingValues>({
    resolver: zodResolver(onboardingSchema),
    defaultValues,
    mode: 'onBlur',
    reValidateMode: 'onBlur',
  })
  const [formError, setFormError] = useState<string | null>(null)

  const submit = handleSubmit(async (values) => {
    setFormError(null)
    try {
      await submitProfileDetails(values)
      onSubmitted()
    } catch (error) {
      setFormError(error instanceof ApiError ? error.message : SUBMIT_FAILED)
    }
  })

  return {
    fields: {
      firstName: register('firstName'),
      lastName: register('lastName'),
      phone: register('phone'),
      corporationNumber: register('corporationNumber'),
    },
    errors: formState.errors,
    isSubmitting: formState.isSubmitting,
    formError,
    submit,
  }
}
