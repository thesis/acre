import { useCallback, useEffect, useMemo, useRef } from "react"

const sessionIdToPromise: Record<
  number,
  {
    promise: Promise<void>
    cancel: (reason: Error) => void
    shouldOpenErrorModal: boolean
  }
> = {}

export default function useCancelPromise(errorMsgText: string) {
  const sessionId = useRef(Math.random())

  useEffect(() => {
    let cancel = (_: Error) => {}
    const promise: Promise<void> = new Promise((_, reject) => {
      cancel = reject
    })

    sessionIdToPromise[sessionId.current] = {
      cancel,
      promise,
      shouldOpenErrorModal: true,
    }
  }, [])

  const cancel = useCallback(() => {
    const currentSessionId = sessionId.current
    const sessionData = sessionIdToPromise[currentSessionId]
    sessionIdToPromise[currentSessionId] = {
      ...sessionData,
      shouldOpenErrorModal: false,
    }

    sessionIdToPromise[currentSessionId].cancel(new Error(errorMsgText))
  }, [errorMsgText])

  const resolve = useCallback(
    () =>
      Promise.race([
        sessionIdToPromise[sessionId.current].promise,
        Promise.resolve(),
      ]),
    [],
  )

  const shouldOpenErrorModal = useMemo(
    () => sessionIdToPromise[sessionId.current]?.shouldOpenErrorModal,
    [],
  )

  return {
    cancel,
    resolve,
    shouldOpenErrorModal,
  }
}
