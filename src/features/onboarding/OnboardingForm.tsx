import { ArrowRightIcon } from '@/components/ArrowRightIcon'
import { Button } from '@/components/Button'
import { TextField } from '@/components/TextField'
import layout from './Onboarding.module.css'
import styles from './OnboardingForm.module.css'

export function OnboardingForm() {
  return (
    <form className={layout.card} noValidate>
      <h1 className={layout.title}>Onboarding Form</h1>
      <div className={styles.fields}>
        <div className={styles.row}>
          <TextField label="First Name" name="firstName" autoComplete="given-name" />
          <TextField label="Last Name" name="lastName" autoComplete="family-name" />
        </div>
        <TextField label="Phone Number" name="phone" type="tel" autoComplete="tel" />
        <TextField label="Corporation Number" name="corporationNumber" inputMode="numeric" />
      </div>
      <Button type="submit" className={styles.submit}>
        Submit <ArrowRightIcon />
      </Button>
    </form>
  )
}
