import { CurrencyType } from "#/types"
import axios from "axios"

const coingeckoApiURL = "https://api.coingecko.com/api/v3"

export const fetchCryptoCurrencyPriceUSD = async (
  name: CurrencyType,
): Promise<number> => {
  const response = await axios.get(
    `${coingeckoApiURL}/simple/price?ids=${name}&vs_currencies=usd`,
  )
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  return response.data[name].usd as number
}
