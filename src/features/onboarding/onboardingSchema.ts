import { z } from 'zod'

export const NAME_MAX_LENGTH = 50

const name = (label: string) =>
  z
    .string()
    .trim()
    .min(1, `${label} is required`)
    .max(NAME_MAX_LENGTH, `${label} must be ${NAME_MAX_LENGTH} characters or fewer`)

export const onboardingSchema = z.object({
  firstName: name('First name'),
  lastName: name('Last name'),
  phone: z
    .string()
    .min(1, 'Phone number is required')
    .regex(/^\+1\d{10}$/, 'Enter the number as +1 followed by 10 digits, with no spaces or dashes'),
  corporationNumber: z
    .string()
    .min(1, 'Corporation number is required')
    .regex(/^\d{9}$/, 'Corporation number must be exactly 9 digits'),
})

export type OnboardingValues = z.infer<typeof onboardingSchema>
