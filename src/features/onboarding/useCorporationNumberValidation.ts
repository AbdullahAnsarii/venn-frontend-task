import { useCallback, useState } from 'react'
import { checkCorporationNumber } from '@/lib/api/corporationNumber'

export type CorporationNumberCheck =
  { status: 'valid' } | { status: 'invalid'; message: string } | { status: 'unavailable' }

export function useCorporationNumberValidation() {
  const [isChecking, setIsChecking] = useState(false)

  const validate = useCallback(async (number: string): Promise<CorporationNumberCheck> => {
    setIsChecking(true)
    try {
      const result = await checkCorporationNumber(number)
      return result.valid ? { status: 'valid' } : { status: 'invalid', message: result.message }
    } catch {
      return { status: 'unavailable' }
    } finally {
      setIsChecking(false)
    }
  }, [])

  return { validate, isChecking }
}
