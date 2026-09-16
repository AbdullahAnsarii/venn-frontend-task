'use client'

import { useState } from 'react'
import { NextStepPlaceholder } from './NextStepPlaceholder'
import { OnboardingForm } from './OnboardingForm'
import styles from './Onboarding.module.css'

const TOTAL_STEPS = 5

export function Onboarding() {
  const [step, setStep] = useState(1)

  return (
    <main className={styles.page}>
      <p className={styles.step}>
        Step {step} of {TOTAL_STEPS}
      </p>
      {step === 1 ? <OnboardingForm onSubmitted={() => setStep(2)} /> : <NextStepPlaceholder />}
    </main>
  )
}
