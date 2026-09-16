import { z } from 'zod'
import { isCanadianPhoneNumber, PHONE_PREFIX } from '@/lib/phone'

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
    .refine((value) => value !== PHONE_PREFIX, 'Phone number is required')
    .regex(/^\+1\d{10}$/, 'Enter the number as +1 followed by 10 digits, with no spaces or dashes')
    .refine(isCanadianPhoneNumber, 'Only Canadian phone numbers are accepted'),
  corporationNumber: z
    .string()
    .min(1, 'Corporation number is required')
    .length(9, 'Corporation number must be exactly 9 characters'),
})

export type OnboardingValues = z.infer<typeof onboardingSchema>
