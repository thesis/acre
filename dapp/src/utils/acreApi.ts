import { env } from "#/constants"
import axiosStatic from "axios"

const axios = axiosStatic.create({
  baseURL: env.ACRE_API_ENDPOINT,
  withCredentials: true,
})

async function getSession() {
  const response = await axios.get<{ nonce: string } | { address: string }>(
    "session",
  )

  return response.data
}

async function createSession(
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

async function deleteSession() {
  await axios.delete("session")
}

type PointsDataResponse = {
  dropAt: number
  isCalculationInProgress: boolean
}

const getPointsData = async () => {
  const url = "points"
  const response = await axios.get<PointsDataResponse>(url)

  return {
    dropAt: response.data.dropAt,
    isCalculationInProgress: response.data.isCalculationInProgress,
  }
}

type PointsDataByUserResponse = {
  isEligible: boolean
  claimed: string
  unclaimed: string
}

const getPointsDataByUser = async (address: string) => {
  const url = `users/${address}/points`
  const response = await axios.get<PointsDataByUserResponse>(url)

  return {
    claimed: Number(response.data.claimed),
    unclaimed: Number(response.data.unclaimed),
    isEligible: response.data.isEligible,
  }
}

type ClaimAcrePointsResponse = {
  claimed: string
  total: string
  claimedAt: number
}
const claimPoints = async (address: string) => {
  const url = `users/${address}/points/claim`
  const response = await axios.post<ClaimAcrePointsResponse>(url)

  return {
    claimed: BigInt(response.data.claimed),
    total: BigInt(response.data.total),
    claimedAt: response.data.claimedAt,
  }
}

const verifyAccessCode = async (encodedCode: string): Promise<boolean> => {
  const response = await axios.post<{ isValid: boolean }>("access/verify", {
    encodedCode,
  })

  return response.data.isValid
}

async function getMats() {
  const response = await axios.get<{ totalMats: number; dailyMats: number }>(
    "mezo/points",
  )

  return {
    totalMats: response.data.totalMats,
    dailyMats: response.data.dailyMats,
  }
}

async function getBtcUsdPrice(): Promise<number> {
  const response = await axios.get<{ btcUsdPrice: number }>("currency/btc")
  return response.data.btcUsdPrice
}

export default {
  createSession,
  getSession,
  deleteSession,
  getPointsData,
  getPointsDataByUser,
  claimPoints,
  verifyAccessCode,
  getMats,
  getBtcUsdPrice,
}
