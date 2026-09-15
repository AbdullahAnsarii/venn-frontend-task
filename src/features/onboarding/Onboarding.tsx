import { OnboardingForm } from './OnboardingForm'
import styles from './Onboarding.module.css'

export function Onboarding() {
  return (
    <main className={styles.page}>
      <p className={styles.step}>Step 1 of 5</p>
      <OnboardingForm />
    </main>
  )
}
