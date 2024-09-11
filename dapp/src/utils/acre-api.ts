import { env } from "#/constants"
import axiosStatic from "axios"

const axios = axiosStatic.create({ baseURL: env.ACRE_API_ENDPOINT })

export async function getSession() {
  const response = await axios.get<{ nonce: string } | { address: string }>(
    "session",
    {
      withCredentials: true,
    },
  )

  return response.data
}

export async function createSession(message: string, signature: string) {
  const response = await axios.post<{ success: boolean }>(
    "session",
    { message, signature },
    { withCredentials: true },
  )

  if (!response.data) {
    throw new Error("Failed to create Acre session")
  }
}

export async function deleteSession() {
  await axios.delete("session")
}
