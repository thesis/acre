import React from "react"
import { Info } from "#/assets/icons"
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverCloseButton,
  PopoverBody,
  Icon,
  PopoverProps,
} from "@chakra-ui/react"
import { CardSizeType } from "#/types"
import { useDocsDrawer, useWalletContext } from "#/hooks"
import { CurrencyBalanceWithConversion } from "./shared/CurrencyBalanceWithConversion"
import { TextMd, TextSm } from "./shared/Typography"
import Alert from "./shared/Alert"

type StakingTokenPopoverProps = PopoverProps & { cardSize: CardSizeType }

export function StakingTokenPopover({
  cardSize,
  ...props
}: StakingTokenPopoverProps) {
  const { isConnected } = useWalletContext()
  const { onOpen: openDocsDrawer } = useDocsDrawer()

  return (
    <Popover
      trigger="click"
      isOpen={isConnected ? undefined : false}
      {...props}
    >
      <PopoverTrigger>
        <Icon
          as={Info}
          cursor={isConnected ? "pointer" : "default"}
          color={isConnected ? "grey.700" : "grey.400"}
        />
      </PopoverTrigger>
      <PopoverContent
        width={cardSize.width + 16}
        height={cardSize.height}
        top={-2}
        left={-2}
      >
        <PopoverCloseButton top={6} right={6} />
        <PopoverBody p={0}>
          <TextMd fontWeight="bold">Liquid staking token</TextMd>
          <CurrencyBalanceWithConversion
            from={{
              amount: "912312331",
              variant: "greater-balance-xl",
              currency: "stbtc",
              size: "4xl",
            }}
            to={{ currency: "usd", color: "grey.500" }}
          />
          <Alert
            mt={5}
            status="info"
            withAlertIcon={false}
            withActionIcon
            onclick={openDocsDrawer}
          >
            <TextSm>
              Your tokens are this Ethereum address once the staking transaction
              is finalized.
            </TextSm>
          </Alert>
        </PopoverBody>
      </PopoverContent>
    </Popover>
  )
}
