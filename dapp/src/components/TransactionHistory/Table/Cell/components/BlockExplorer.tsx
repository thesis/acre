import React from "react"
import { Chain } from "#/types"
import { BLOCK_EXPLORER } from "#/constants"
import ViewInBlockExplorer from "#/components/shared/ViewInBlockExplorer"
import SimpleText from "./SimpleText"

function BlockExplorer({ txHash, chain }: { txHash?: string; chain: Chain }) {
  if (txHash) {
    return (
      <ViewInBlockExplorer
        id={txHash}
        type="transaction"
        chain={chain}
        size="sm"
      />
    )
  }
  return <SimpleText color="grey.400">{BLOCK_EXPLORER[chain].title}</SimpleText>
}

export default BlockExplorer
