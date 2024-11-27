import { backoffRetrier, RetryOptions } from "../utils"

/**
 * Represents an abstract HTTP API.
 */
export default abstract class HttpApi {
  #apiUrl: string

  /**
   * Retry options for API requests.
   */
  #retryOptions: RetryOptions

  constructor(
    apiUrl: string,
    retryOptions: RetryOptions = {
      retries: 5,
      backoffStepMs: 1000,
    },
  ) {
    this.#apiUrl = apiUrl
    this.#retryOptions = retryOptions
  }

  /**
   * Makes an HTTP request with retry logic.
   * @param requestFn Function that returns a Promise of the HTTP response.
   * @returns The HTTP response.
   * @throws Error if the request fails after all retries.
   */
  async requestWithRetry(
    requestFn: () => Promise<Response>,
  ): Promise<Response> {
    return backoffRetrier<Response>(
      this.#retryOptions.retries,
      this.#retryOptions.backoffStepMs,
    )(async () => {
      const response = await requestFn()

      if (!response.ok) {
        throw new Error(`Request failed: ${await response.text()}`)
      }

      return response
    })
  }

  /**
   * Factory function for running GET requests.
   * @param endpoint API endpoint.
   * @param requestInit Additional data passed to request.
   * @returns API response.
   */
  protected async getRequest(
    endpoint: string,
    requestInit?: RequestInit,
  ): Promise<Response> {
    return fetch(new URL(endpoint, this.#apiUrl), {
      credentials: "include",
      ...requestInit,
    })
  }

  /**
   * Factory function for running POST requests.
   * @param endpoint API endpoint,
   * @param body Data passed to POST request.
   * @param requestInit Additional data passed to request.
   * @returns API response.
   */
  protected async postRequest(
    endpoint: string,
    body: unknown,
    requestInit?: RequestInit,
  ): Promise<Response> {
    return fetch(new URL(endpoint, this.#apiUrl), {
      method: "POST",
      body: JSON.stringify(body),
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      ...requestInit,
    })
  }
}
