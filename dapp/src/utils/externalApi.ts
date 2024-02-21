import { CoingeckoSymbolType } from "#/types"
import axios from "axios"

const coingeckoApiURL = "https://api.coingecko.com/api/v3"

export const fetchCryptoCurrencyPriceUSD = async (
  coingeckoSymbol: CoingeckoSymbolType,
): Promise<number> => {
  const response = await axios.get(
    `${coingeckoApiURL}/simple/price?ids=${coingeckoSymbol}&vs_currencies=usd`,
  )
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  return response.data[coingeckoSymbol].usd as number
}
