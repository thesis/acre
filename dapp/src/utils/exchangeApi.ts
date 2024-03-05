import axios from "axios"
import { CoingeckoIdType, CoingeckoCurrencyType } from "#/types"

const coingeckoApiURL = "https://api.coingecko.com/api/v3"

type CoingeckoSimplePriceResponse = {
  data: {
    [id in CoingeckoIdType]: Record<CoingeckoCurrencyType, number>
  }
}

export const fetchCryptoCurrencyPriceUSD = async (
  coingeckoId: CoingeckoIdType,
): Promise<number> => {
  const response: CoingeckoSimplePriceResponse = await axios.get(
    `${coingeckoApiURL}/simple/price?ids=${coingeckoId}&vs_currencies=usd`,
  )

  return response.data[coingeckoId].usd
}
