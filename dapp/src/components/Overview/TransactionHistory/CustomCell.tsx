import React from "react"
import { Box, Icon, Text, Link, HStack } from "@chakra-ui/react"
import { BITCOIN, ETHEREUM } from "../../../constants"
import { BitcoinSymbol, TBTCSymbol } from "../../../static/icons"

export default function Cell({
  children1,
  children2,
}: {
  children1: React.ReactElement
  children2: React.ReactElement
}) {
  return (
    <Box display="flex" flexDirection="column" width="100%">
      <Box bg="#FAF5E7" p={3}>
        {children1}
      </Box>
      <Box bg="#FAF5E7" p={3}>
        {children2}
      </Box>
    </Box>
  )
}

function AssetCell({ asset }: { asset: string }) {
  return (
    <HStack>
      <Icon as={asset === BITCOIN.token ? BitcoinSymbol : TBTCSymbol} />
      <Text>{asset}</Text>
    </HStack>
  )
}

function BlockExplorerCell({ txHash }: { txHash: string }) {
  const isEthTx = txHash.includes("0x")
  const blockExplorer = isEthTx ? ETHEREUM.blockExplorer : BITCOIN.blockExplorer
  const text = `See on ${isEthTx ? "Etherscan" : "Blockstream"}`
  return (
    <Link href={`${blockExplorer}/tx/${txHash}`} isExternal>
      {text}
    </Link>
  )
}
export function getCustomCell(
  type: "text" | "asset" | "link",
  value1: string,
  value2: string,
) {
  switch (type) {
    case "text":
      return (
        <Cell
          children1={<Text>{value1}</Text>}
          children2={<Text>{value2}</Text>}
        />
      )
    case "asset":
      return (
        <Cell
          children1={<AssetCell asset={value1} />}
          children2={<AssetCell asset={value2} />}
        />
      )
    case "link":
      return (
        <Cell
          children1={<BlockExplorerCell txHash={value1} />}
          children2={<BlockExplorerCell txHash={value2} />}
        />
      )
    default:
      return null
  }
}
