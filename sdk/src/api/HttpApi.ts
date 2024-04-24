/**
 * Represents an abstract HTTP API.
 */
export default abstract class HttpApi {
  #apiUrl: string

  constructor(apiUrl: string) {
    this.#apiUrl = apiUrl
  }

  /**
   * Factory function for running GET requests
   * @param endpoint api endpoint
   * @param requestInit additional data passed to request
   * @returns api response
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
   * Factory function for running POST requests
   * @param endpoint api endpoint
   * @param body data passed to POST request
   * @param requestInit additional data passed to request
   * @returns api response
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
