import { env } from "#/constants"
import axiosStatic from "axios"

const axios = axiosStatic.create({
  baseURL: env.ACRE_API_ENDPOINT,
  withCredentials: true,
})

export async function getSession() {
  const response = await axios.get<{ nonce: string } | { address: string }>(
    "session",
  )

  return response.data
}

export async function createSession(
  message: string,
  signature: string,
  publicKey: string,
) {
  const response = await axios.post<{ success: boolean }>("session", {
    message,
    signature,
    publicKey,
  })

  if (!response.data.success) {
    throw new Error("Failed to create Acre session")
  }
}

export async function deleteSession() {
  await axios.delete("session")
}
