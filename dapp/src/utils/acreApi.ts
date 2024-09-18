import { env } from "#/constants"
import axios from "axios"

const { ACRE_API_ENDPOINT } = env

type PointsDataResponse = {
  dropAt: number
}

const getPointsData = async () => {
  const url = `${ACRE_API_ENDPOINT}points`
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
  const url = `${ACRE_API_ENDPOINT}users/${address}/points`
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
  const url = `${ACRE_API_ENDPOINT}users/points/${address}/claim`
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
