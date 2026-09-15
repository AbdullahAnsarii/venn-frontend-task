import { isValidNumberForRegion } from 'libphonenumber-js'

export const PHONE_PREFIX = '+1'

export function isCanadianPhoneNumber(value: string): boolean {
  return isValidNumberForRegion(value, 'CA')
}
