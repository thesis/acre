/**
 * If the promise fails, log the underlying error but maintain the failed
 * promise.
 *
 * Does nothing to successful promises.
 */
export function logPromiseFailure<T>(promise: Promise<T>) {
  promise.catch((error) => {
    throw error
  })
}
