import axios from "axios"
import { Currency } from "#/types"

const coingeckoApiURL = "https://api.coingecko.com/api/v3"

export const fetchCryptoCurrencyPriceUSD = async ({
  name
}: Currency) => {
    const response = await axios.get(
      `${coingeckoApiURL}/simple/price?ids=${name}&vs_currencies=usd`
    )
    return response.data[name.toLowerCase()].usd;
}
