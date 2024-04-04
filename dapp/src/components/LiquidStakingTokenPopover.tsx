import React from "react"
import { Info } from "#/assets/icons"
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverCloseButton,
  PopoverBody,
  PopoverProps,
  IconButton,
} from "@chakra-ui/react"
import { SizeType } from "#/types"
import { useDocsDrawer, useWalletContext } from "#/hooks"
import { TextMd, TextSm } from "./shared/Typography"
import { CurrencyBalance } from "./shared/CurrencyBalance"
import { CardAlert } from "./shared/alerts"

type LiquidStakingTokenPopoverProps = PopoverProps & { popoverSize: SizeType }

export function LiquidStakingTokenPopover({
  popoverSize,
  ...props
}: LiquidStakingTokenPopoverProps) {
  const { isConnected } = useWalletContext()
  const { onOpen: openDocsDrawer } = useDocsDrawer()

  return (
    <Popover variant="no-transform" {...props}>
      <PopoverTrigger>
        <IconButton
          variant="ghost"
          justifyContent="end"
          icon={
            <Info boxSize={5} color={isConnected ? "grey.700" : "grey.400"} />
          }
          _disabled={{
            cursor: "default",
          }}
          isDisabled={!isConnected}
          aria-label="Liquid staking details"
        />
      </PopoverTrigger>
      <PopoverContent
        width={popoverSize.width + 16}
        height={popoverSize.height}
        top={-2}
        left={-2}
      >
        <PopoverCloseButton />
        <PopoverBody p={0}>
          <TextMd fontWeight="bold">Liquid staking token</TextMd>
          <CurrencyBalance
            amount="912312331"
            variant="greater-balance-xl"
            currency="stbtc"
          />
          <CardAlert
            mt={5}
            status="info"
            withIcon={false}
            withLink
            onClick={openDocsDrawer}
          >
            <TextSm>
              Your tokens are this Ethereum address once the staking transaction
              is finalized.
            </TextSm>
          </CardAlert>
        </PopoverBody>
      </PopoverContent>
    </Popover>
  )
}
