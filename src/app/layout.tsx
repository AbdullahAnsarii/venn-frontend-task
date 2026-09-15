import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import type { ReactNode } from 'react'
import './globals.css'

const interFont = Inter({ subsets: ['latin'], weight: ['400', '500'], variable: '--font-dm-sans' })

export const metadata: Metadata = {
  title: 'Onboarding',
  description: 'Tell us about you and your business',
}

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en" className={interFont.variable}>
      <body>{children}</body>
    </html>
  )
}
