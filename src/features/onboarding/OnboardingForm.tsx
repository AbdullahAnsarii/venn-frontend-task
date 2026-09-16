'use client'

import { ArrowRightIcon } from '@/components/ArrowRightIcon'
import { Button } from '@/components/Button'
import { TextField } from '@/components/TextField'
import layout from './Onboarding.module.css'
import styles from './OnboardingForm.module.css'
import { useOnboardingForm } from './hooks/useOnboardingForm'

type OnboardingFormProps = {
  onSubmitted: () => void
}

export function OnboardingForm({ onSubmitted }: OnboardingFormProps) {
  const { fields, errors, isSubmitting, isCheckingCorporationNumber, formError, submit } =
    useOnboardingForm({ onSubmitted })

  return (
    <form className={layout.card} onSubmit={submit} noValidate>
      <h1 className={layout.title}>Onboarding Form</h1>
      <div className={styles.fields}>
        <div className={styles.row}>
          <TextField
            label="First Name"
            autoComplete="given-name"
            error={errors.firstName?.message}
            {...fields.firstName}
          />
          <TextField
            label="Last Name"
            autoComplete="family-name"
            error={errors.lastName?.message}
            {...fields.lastName}
          />
        </div>
        <TextField
          label="Phone Number"
          type="tel"
          autoComplete="tel"
          error={errors.phone?.message}
          {...fields.phone}
        />
        <TextField
          label="Corporation Number"
          inputMode="numeric"
          loading={isCheckingCorporationNumber}
          error={errors.corporationNumber?.message}
          {...fields.corporationNumber}
        />
      </div>
      {formError && (
        <p className={styles.formError} role="alert">
          {formError}
        </p>
      )}
      <Button
        type="submit"
        className={styles.submit}
        loading={isSubmitting}
        icon={<ArrowRightIcon />}
      >
        {isSubmitting ? 'Submitting' : 'Submit'}
      </Button>
    </form>
  )
}
