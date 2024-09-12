import { ACRE_POINTS_REWARDS_MULTIPLERS } from "#/constants"
import { AcrePointsClaimTier } from "#/types"
import axios from "axios"
import { bigIntStringToNumber, numberToLocaleString } from "./numbers"

const acreApiEndpoint = "http://localhost:8788/api/v1"

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
  dropAt: number
}
const getAcrePoints = async (address = "") => {
  const url = `${acreApiEndpoint}/points/${address}`
  const response = await axios.get<ClaimedAcrePointsResponse>(url)

  return {
    claimed: bigIntStringToNumber(response.data.claimed),
    unclaimed: bigIntStringToNumber(response.data.unclaimed),
    isEligible: response.data.isEligible,
    dropAt: response.data.dropAt,
  }
}

type ClaimAcrePointsResponse = {
  claimed: string
  total: string
  claimedAt: number
}
const handleClaimAcrePoints = async (address: string) => {
  const url = `${acreApiEndpoint}/points/claim/${address}`
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
}
