import { SEARCH_PARAMS_NAMES } from "#/router/path"

const MAX_UINT16 = 65535

const isValidReferral = (value: number) => {
  const isInteger = Number.isInteger(value)
  return isInteger && value >= 0 && value <= MAX_UINT16
}

const getReferralFromURL = () => {
  const params = new URLSearchParams(window.location.search)
  return params.get(SEARCH_PARAMS_NAMES.referral)
}

export default {
  isValidReferral,
  getReferralFromURL,
}
