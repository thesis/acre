import { backoffRetrier } from "@keep-network/tbtc-v2.ts"

type BackoffRetrierParameters = Parameters<typeof backoffRetrier>

type RetryOptions = {
  /**
   * The number of retries to perform before bubbling the failure out.
   * @see backoffRetrier for more details.
   */
  retires: BackoffRetrierParameters[0]
  /**
   * Initial backoff step in milliseconds that will be increased exponentially
   * for subsequent retry attempts. (default = 1000 ms)
   * @see backoffRetrier for more details.
   */
  backoffStepMs: BackoffRetrierParameters[1]
}

export { backoffRetrier, RetryOptions }
