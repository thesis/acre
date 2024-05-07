/**
 * Represents an abstract HTTP API.
 */
export default abstract class HttpApi {
  #apiUrl: string

  constructor(apiUrl: string) {
    this.#apiUrl = apiUrl
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
