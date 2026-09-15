import { useId, type ComponentProps } from 'react'
import styles from './TextField.module.css'

type TextFieldProps = ComponentProps<'input'> & {
  label: string
  error?: string
  hint?: string
}

export function TextField({ label, error, hint, id, ...inputProps }: TextFieldProps) {
  const generatedId = useId()
  const inputId = id ?? generatedId
  const hintId = `${inputId}-hint`
  const errorId = `${inputId}-error`
  const describedBy = [hint && hintId, error && errorId].filter(Boolean).join(' ') || undefined

  return (
    <div className={styles.field}>
      <label htmlFor={inputId} className={styles.label}>
        {label}
      </label>
      <input
        id={inputId}
        className={error ? `${styles.input} ${styles.invalid}` : styles.input}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        {...inputProps}
      />
      <div className={styles.message}>
        {hint && (
          <p id={hintId} className={styles.hint} role="status">
            {hint}
          </p>
        )}
        {error && (
          <p id={errorId} className={styles.error} role="alert">
            {error}
          </p>
        )}
      </div>
    </div>
  )
}
