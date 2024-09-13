import { ACRE_POINTS_REWARDS_MULTIPLERS, env } from "#/constants"
import { AcrePointsClaimTier } from "#/types"
import axios from "axios"
import { bigIntStringToNumber, numberToLocaleString } from "./numbers"

const { ACRE_API_ENDPOINT } = env

const estimateRewardAmountPerTier = (
  baseReward: number,
  tier: AcrePointsClaimTier,
) => {
  const multipler = ACRE_POINTS_REWARDS_MULTIPLERS[tier]
  return baseReward * multipler
}

const getFormattedAmount = (amount: number) => numberToLocaleString(amount, 0)

const getPointsFromAmount = (amount: bigint) => Number(amount)

// TODO: Add authentication headers

type ClaimedAcrePointsResponse = {
  isEligible: boolean
  claimed: string
  unclaimed: string
}
const getAcrePoints = async (address = "") => {
  const url = `${ACRE_API_ENDPOINT}/users/${address}/points`
  const response = await axios.get<ClaimedAcrePointsResponse>(url)

  return {
    claimed: bigIntStringToNumber(response.data.claimed),
    unclaimed: bigIntStringToNumber(response.data.unclaimed),
    isEligible: response.data.isEligible,
  }
}

type AcrePointsDropTimeResponse = {
  dropAt: number
}
const getAcrePointsDropTime = async () => {
  const url = `${ACRE_API_ENDPOINT}/users/points/drop-time`
  const response = await axios.get<AcrePointsDropTimeResponse>(url)

  return {
    dropAt: response.data.dropAt,
  }
}

type ClaimAcrePointsResponse = {
  claimed: string
  total: string
  claimedAt: number
}
const handleClaimAcrePoints = async (address: string) => {
  const url = `${ACRE_API_ENDPOINT}/users/points/${address}/claim`
  const response = await axios.post<ClaimAcrePointsResponse>(url)

  return {
    claimed: bigIntStringToNumber(response.data.claimed),
    total: bigIntStringToNumber(response.data.total),
    claimedAt: response.data.claimedAt,
  }
}

export default {
  estimateRewardAmountPerTier,
  getFormattedAmount,
  getAcrePoints,
  handleClaimAcrePoints,
  getPointsFromAmount,
  getAcrePointsDropTime,
}
