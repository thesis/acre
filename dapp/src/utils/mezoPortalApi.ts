import { env } from "#/constants"
import axios from "axios"

export const endpoint = env.USE_TESTNET
  ? "https://portal.api.test.mezo.org/api/v1"
  : "https://portal.api.mezo.org/api/v1"

async function getMats() {
  try {
    const url = `${endpoint}/acre`
    const response = await axios.get<{ totalMats: number; dailyMats: number }>(
      url,
      {
        headers: { Authorization: `Bearer ${env.MEZO_PORTAL_API_KEY}` },
      },
    )

    return response.data
  } catch (error) {
    console.error(error)
    throw error
  }
}

export default {
  getMats,
}
