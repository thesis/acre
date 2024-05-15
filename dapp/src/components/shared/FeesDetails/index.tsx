import React from "react"
import { ListItem, ListItemProps, VStack } from "@chakra-ui/react"
import { TextMd, TextSm } from "../Typography"

export type FeesDetailsItemProps = {
  label: string
  sublabel?: string
  value?: string
  tooltip: React.ReactElement
  children?: React.ReactNode
} & ListItemProps

function FeesDetailsItem({
  label,
  sublabel,
  tooltip,
  value,
  children,
  ...listItemProps
}: FeesDetailsItemProps) {
  return (
    <ListItem
      display="flex"
      justifyContent="space-between"
      alignItems="center"
      {...listItemProps}
    >
      <VStack alignItems="start" gap={0}>
        <TextMd
          display="flex"
          alignItems="center"
          fontWeight="semibold"
          color="grey.700"
        >
          {label}
          {tooltip}
        </TextMd>
        {sublabel && <TextSm color="grey.400">{sublabel}</TextSm>}
      </VStack>
      {value ? <TextMd color="grey.700">{value}</TextMd> : children}
    </ListItem>
  )
}

export default FeesDetailsItem
