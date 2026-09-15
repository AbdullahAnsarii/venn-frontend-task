import { isValidNumberForRegion } from 'libphonenumber-js'

export function isCanadianPhoneNumber(value: string): boolean {
  return isValidNumberForRegion(value, 'CA')
}
