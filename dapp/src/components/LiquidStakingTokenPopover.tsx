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
import { useDocsDrawer, useSharesBalance, useWalletContext } from "#/hooks"
import { TextMd, TextSm } from "./shared/Typography"
import Alert from "./shared/Alert"
import { CurrencyBalance } from "./shared/CurrencyBalance"

type LiquidStakingTokenPopoverProps = PopoverProps & { popoverSize: SizeType }

export function LiquidStakingTokenPopover({
  popoverSize,
  ...props
}: LiquidStakingTokenPopoverProps) {
  const { isConnected } = useWalletContext()
  const { onOpen: openDocsDrawer } = useDocsDrawer()
  const sharesBalance = useSharesBalance()

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
            amount={sharesBalance.toString()}
            variant="greater-balance-xl"
            currency="stbtc"
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
