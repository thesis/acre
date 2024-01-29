import React from "react"
import { Chain, ExplorerDataType } from "#/types"
import { Link, LinkProps } from "@chakra-ui/react"
import { createLinkToBlockExplorerForChain } from "#/utils"

type ViewInBlockExplorerLinkProps = {
  text?: string
  id: string
  type: ExplorerDataType
  chain?: Chain
} & Omit<LinkProps, "isExternal">

function ViewInBlockExplorerLink({
  text,
  id,
  type,
  chain = "ethereum",
  ...linkProps
}: ViewInBlockExplorerLinkProps) {
  const { link, title } = createLinkToBlockExplorerForChain(chain, id, type)

  // TODO: Update when ButtonLink is ready
  return (
    <Link href={link} isExternal {...linkProps}>
      {text ?? title}
    </Link>
  )
}

export default ViewInBlockExplorerLink
