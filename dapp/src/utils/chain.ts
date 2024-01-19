import { BLOCK_EXPLORER } from "#/constants"
import { Chain, ExplorerDataType } from "#/types"

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
