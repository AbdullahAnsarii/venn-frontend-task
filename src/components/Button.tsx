import type { ComponentProps, ReactNode } from 'react'
import { Spinner } from './Spinner'
import styles from './Button.module.css'

type ButtonProps = ComponentProps<'button'> & {
  loading?: boolean
  icon?: ReactNode
}

export function Button({
  loading = false,
  icon,
  disabled,
  className,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={className ? `${styles.button} ${className}` : styles.button}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...props}
    >
      {children}
      {loading ? <Spinner /> : icon}
    </button>
  )
}
