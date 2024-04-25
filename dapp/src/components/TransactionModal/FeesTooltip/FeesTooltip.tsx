import React from "react"
import { Info } from "#/assets/icons"
import { Icon, Tooltip, List } from "@chakra-ui/react"
import { DepositFee } from "#/types"
import { useTransactionFee } from "#/hooks/useTransactionFee"
import { FeesTooltipItem } from "./FeesTooltipItem"

const mapFeeKeyToLabel = (feeId: keyof DepositFee) => {
  switch (feeId) {
    case "acre":
      return "Acre protocol fees"
    case "tbtc":
      return "tBTC bridge fees"
    case "total":
      return "Bitcoin network fees"
    default:
      return ""
  }
}

export function FeesTooltip() {
  const estimatedDepositFee = useTransactionFee()

  return (
    <Tooltip
      placement="right"
      label={
        <List spacing={0.5} minW={60}>
          {Object.entries(estimatedDepositFee).map(([feeKey, feeValue]) => (
            <FeesTooltipItem
              key={feeKey}
              label={mapFeeKeyToLabel(feeKey as keyof DepositFee)}
              amount={feeValue}
              currency="bitcoin"
            />
          ))}
        </List>
      }
    >
      <Icon as={Info} ml={2} boxSize={4} cursor="pointer" color="grey.400" />
    </Tooltip>
  )
}
