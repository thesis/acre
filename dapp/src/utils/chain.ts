import { BLOCK_EXPLORER } from "#/constants"
import { Chain, ExplorerDataType } from "#/types"

// At this moment, the function returns
// the correct part of the URL only for the transaction.
//  However, it provides us with an easy way
// to handle the next data for block explorer.
export const createBlockExplorerLink = (
  prefix: string,
  id: string,
  type: ExplorerDataType,
) => {
  switch (type) {
    case "transaction":
    default: {
      return `${prefix}/tx/${id}`
    }
  }
}

export const createLinkToBlockExplorerForChain = (
  chain: Chain,
  id: string,
  type: ExplorerDataType,
) => {
  const { title, url } = BLOCK_EXPLORER[chain]
  const link = createBlockExplorerLink(url, id, type)
  return { title, link }
}
