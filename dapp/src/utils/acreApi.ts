import { env } from "#/constants"
import axiosStatic from "axios"

const axios = axiosStatic.create({
  baseURL: env.ACRE_API_ENDPOINT,
  withCredentials: true,
})

type PointsDataResponse = {
  dropAt: number
}

const getPointsData = async () => {
  const url = "points"
  const response = await axios.get<PointsDataResponse>(url)

  return {
    dropAt: response.data.dropAt,
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
    claimed: BigInt(response.data.claimed),
    unclaimed: BigInt(response.data.unclaimed),
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
    claimed: response.data.claimed,
    total: BigInt(response.data.total),
    claimedAt: response.data.claimedAt,
  }
}

export default {
  getPointsData,
  getPointsDataByUser,
  claimPoints,
}
