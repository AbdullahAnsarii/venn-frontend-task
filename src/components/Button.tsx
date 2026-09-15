import type { ComponentProps } from 'react'
import styles from './Button.module.css'

export function Button({ className, children, ...props }: ComponentProps<'button'>) {
  return (
    <button className={className ? `${styles.button} ${className}` : styles.button} {...props}>
      {children}
    </button>
  )
}
