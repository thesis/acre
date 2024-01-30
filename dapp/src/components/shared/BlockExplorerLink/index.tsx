import React from "react"
import { Chain, ExplorerDataType } from "#/types"
import { Link, LinkProps } from "@chakra-ui/react"
import { createLinkToBlockExplorerForChain } from "#/utils"

type BlockExplorerLinkProps = {
  text?: string
  id: string
  type: ExplorerDataType
  chain?: Chain
} & Omit<LinkProps, "isExternal">

function BlockExplorerLink({
  text,
  id,
  type,
  chain = "ethereum",
  ...linkProps
}: BlockExplorerLinkProps) {
  const { link, title } = createLinkToBlockExplorerForChain(chain, id, type)

  // TODO: Update when ButtonLink is ready
  return (
    <Link href={link} isExternal {...linkProps}>
      {text ?? title}
    </Link>
  )
}

export default BlockExplorerLink
