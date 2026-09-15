import { useId, type ComponentProps } from 'react'
import { Spinner } from './Spinner'
import styles from './TextField.module.css'

type TextFieldProps = ComponentProps<'input'> & {
  label: string
  error?: string
  loading?: boolean
}

export function TextField({ label, error, loading = false, id, ...inputProps }: TextFieldProps) {
  const generatedId = useId()
  const inputId = id ?? generatedId
  const statusId = `${inputId}-status`
  const errorId = `${inputId}-error`
  const describedBy = [loading && statusId, error && errorId].filter(Boolean).join(' ') || undefined
  const inputClassName = [styles.input, error && styles.invalid, loading && styles.loading]
    .filter(Boolean)
    .join(' ')

  return (
    <div className={styles.field}>
      <label htmlFor={inputId} className={styles.label}>
        {label}
      </label>
      <div className={styles.control}>
        <input
          id={inputId}
          className={inputClassName}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          {...inputProps}
        />
        {loading && (
          <span className={styles.spinner}>
            <Spinner />
          </span>
        )}
      </div>
      <div className={styles.message}>
        {loading && (
          <p id={statusId} className={styles.srOnly} role="status">
            Checking {label}…
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
