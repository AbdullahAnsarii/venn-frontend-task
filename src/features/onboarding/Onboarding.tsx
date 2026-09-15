import styles from './Onboarding.module.css'

export function Onboarding() {
  return (
    <main className={styles.page}>
      <p className={styles.step}>Step 1 of 5</p>
      <section className={styles.card}>
        <h1 className={styles.title}>Onboarding Form</h1>
      </section>
    </main>
  )
}
