import React from "react"
import { Info } from "#/assets/icons"
import { Icon, Tooltip, List } from "@chakra-ui/react"
import { FeesTooltipItem } from "./FeesTooltipItem"
import { Fee as AcreFee } from "../../../types/fee"

type Props = {
  fees: Omit<AcreFee, "total">
}

const mapFeeToLabel = (feeId: keyof AcreFee) => {
  switch (feeId) {
    case "acre":
      return "Acre protocol fees"
    case "tbtc":
      return "tBTC bridge fees"
    default:
      return ""
  }
}

export function FeesTooltip({ fees }: Props) {
  return (
    <Tooltip
      placement="right"
      label={
        <List spacing={0.5} minW={60}>
          {Object.entries(fees).map(([feeKey, feeValue]) => (
            <FeesTooltipItem
              key={feeKey}
              label={mapFeeToLabel(feeKey as keyof AcreFee)}
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
