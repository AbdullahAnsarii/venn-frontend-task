import { describe, expect, it } from 'vitest'
import { isCanadianPhoneNumber } from './phone'

describe('isCanadianPhoneNumber', () => {
  it.each(['+13062776103', '+14165550123', '+16045550123', '+19025550123'])(
    'accepts %s',
    (value) => {
      expect(isCanadianPhoneNumber(value)).toBe(true)
    },
  )

  it.each(['+12065550123', '+12125550123', '+447911123456', '+1306277610', ''])(
    'rejects %s',
    (value) => {
      expect(isCanadianPhoneNumber(value)).toBe(false)
    },
  )

  it('accepts national format, the schema enforces +1', () => {
    expect(isCanadianPhoneNumber('3062776103')).toBe(true)
  })
})
