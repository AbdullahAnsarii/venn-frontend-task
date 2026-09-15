import type { ComponentProps } from 'react'
import styles from './Button.module.css'

type ButtonProps = ComponentProps<'button'> & {
  loading?: boolean
}

export function Button({ loading = false, disabled, className, children, ...props }: ButtonProps) {
  return (
    <button
      className={className ? `${styles.button} ${className}` : styles.button}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...props}
    >
      {children}
    </button>
  )
}
