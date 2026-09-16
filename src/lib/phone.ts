import { parsePhoneNumberFromString } from 'libphonenumber-js'

export const PHONE_PREFIX = '+1'

export function isCanadianPhoneNumber(value: string): boolean {
  const phoneNumber = parsePhoneNumberFromString(value, 'CA')
  return phoneNumber?.country === 'CA' && phoneNumber.isValid()
}
