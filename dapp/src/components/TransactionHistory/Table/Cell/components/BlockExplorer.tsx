import React from "react"
import { Chain } from "#/types"
import { BLOCK_EXPLORER } from "#/constants"
import BlockExplorerLink from "#/components/shared/BlockExplorerLink"
import SimpleText from "./SimpleText"

function BlockExplorer({ txHash, chain }: { txHash?: string; chain: Chain }) {
  if (txHash) {
    return <BlockExplorerLink id={txHash} type="transaction" chain={chain} />
  }
  return <SimpleText color="grey.400">{BLOCK_EXPLORER[chain].title}</SimpleText>
}

export default BlockExplorer
