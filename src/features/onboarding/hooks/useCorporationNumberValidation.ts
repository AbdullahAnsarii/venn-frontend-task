import { useCallback, useRef, useState } from 'react'
import { checkCorporationNumber } from '@/lib/api/corporationNumber'

export type CorporationNumberCheck =
  | { status: 'valid' }
  | { status: 'invalid'; message: string }
  | { status: 'unavailable' }
  | { status: 'superseded' }

type Lookup = {
  number: string
  controller: AbortController
  promise: Promise<CorporationNumberCheck>
}

async function check(number: string, signal: AbortSignal): Promise<CorporationNumberCheck> {
  try {
    const result = await checkCorporationNumber(number, signal)
    return result.valid ? { status: 'valid' } : { status: 'invalid', message: result.message }
  } catch {
    return signal.aborted ? { status: 'superseded' } : { status: 'unavailable' }
  }
}

export function useCorporationNumberValidation() {
  const [isChecking, setIsChecking] = useState(false)
  const results = useRef(new Map<string, CorporationNumberCheck>())
  const inFlight = useRef<Lookup | null>(null)

  const validate = useCallback((number: string): Promise<CorporationNumberCheck> => {
    const known = results.current.get(number)
    if (known) {
      return Promise.resolve(known)
    }
    if (inFlight.current?.number === number) {
      return inFlight.current.promise
    }

    inFlight.current?.controller.abort()

    const controller = new AbortController()
    const promise = check(number, controller.signal).then((result) => {
      if (result.status === 'valid' || result.status === 'invalid') {
        results.current.set(number, result)
      }
      return result
    })
    const lookup: Lookup = { number, controller, promise }
    inFlight.current = lookup
    setIsChecking(true)

    void promise.finally(() => {
      if (inFlight.current === lookup) {
        inFlight.current = null
        setIsChecking(false)
      }
    })

    return promise
  }, [])

  return { validate, isChecking }
}
