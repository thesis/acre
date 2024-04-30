import React from "react"
import { Info } from "#/assets/icons"
import { Icon, Tooltip, List } from "@chakra-ui/react"
import { FeesTooltipItem } from "./FeesTooltipItem"

type Fee = { [key: string]: bigint }

type Props<F extends Fee> = {
  fees: F
  mapFeeToLabel: (feeName: keyof F) => string
}

export function FeesTooltip<F extends Fee>({ fees, mapFeeToLabel }: Props<F>) {
  return (
    <Tooltip
      placement="right"
      label={
        <List spacing={0.5} minW={60}>
          {Object.entries(fees).map(([feeKey, feeValue]) => (
            <FeesTooltipItem
              key={feeKey}
              label={mapFeeToLabel(feeKey)}
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
