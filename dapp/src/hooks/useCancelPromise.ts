import { useCallback, useEffect } from "react"

const sessionIdToPromise: Record<
  number,
  {
    promise: Promise<void>
    cancel: (reason: Error) => void
    shouldOpenErrorModal: boolean
  }
> = {}

export default function useCancelPromise(
  sessionId: number,
  errorMsgText: string,
) {
  useEffect(() => {
    let cancel = (_: Error) => {}
    const promise: Promise<void> = new Promise((_, reject) => {
      cancel = reject
    })

    sessionIdToPromise[sessionId] = {
      cancel,
      promise,
      shouldOpenErrorModal: true,
    }
  }, [sessionId])

  const cancel = useCallback(() => {
    const sessionData = sessionIdToPromise[sessionId]
    sessionIdToPromise[sessionId] = {
      ...sessionData,
      shouldOpenErrorModal: false,
    }

    sessionIdToPromise[sessionId].cancel(new Error(errorMsgText))
  }, [errorMsgText, sessionId])

  const resolve = useCallback(
    () =>
      Promise.race([sessionIdToPromise[sessionId].promise, Promise.resolve()]),
    [sessionId],
  )

  return {
    cancel,
    resolve,
    sessionIdToPromise,
  }
}
