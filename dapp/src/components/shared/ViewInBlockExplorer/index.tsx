import React from "react"
import { Chain, ExplorerDataType } from "#/types"
import { Link } from "@chakra-ui/react"
import { createLinkToBlockExplorerForChain } from "#/utils"

type ViewInBlockExplorerProps = {
  text?: string
  id: string
  type: ExplorerDataType
  chain?: Chain
}

function ViewInBlockExplorer({
  text,
  id,
  type,
  chain = "ethereum",
}: ViewInBlockExplorerProps) {
  const { link, title } = createLinkToBlockExplorerForChain(chain, id, type)

  return (
    // TODO: Use a button link
    <Link href={link} isExternal>
      {text ?? title}
    </Link>
  )
}

export default ViewInBlockExplorer
