'use client'

import { useEffect, useRef } from 'react'
import styles from './Onboarding.module.css'

export function NextStepPlaceholder() {
  const heading = useRef<HTMLHeadingElement>(null)

  useEffect(() => {
    heading.current?.focus()
  }, [])

  return (
    <section className={styles.card}>
      <h1 ref={heading} tabIndex={-1} className={styles.title}>
        Profile saved
      </h1>
      <p className={styles.message}>This is a placeholder for the next step of the onboarding.</p>
    </section>
  )
}
