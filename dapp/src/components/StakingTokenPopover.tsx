import React from "react"
import { ArrowUpRight, Info } from "#/assets/icons"
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverCloseButton,
  PopoverBody,
  Icon,
  Card,
  CardBody,
  HStack,
  StackDivider,
  PopoverProps,
} from "@chakra-ui/react"
import { CardSizeType } from "#/types"
import { useDocsDrawer, useWalletContext } from "#/hooks"
import { CurrencyBalanceWithConversion } from "./shared/CurrencyBalanceWithConversion"
import { TextMd, TextSm } from "./shared/Typography"

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
          <Card borderColor="white" borderWidth={0.5} mt={5}>
            <CardBody p={0}>
              <HStack
                divider={
                  <StackDivider
                    marginInlineStart="0 !important"
                    marginInlineEnd="0 !important"
                    borderColor="white"
                  />
                }
              >
                <TextSm my={4} mx={5}>
                  Your tokens are this Ethereum address once the staking
                  transaction is finalized.
                </TextSm>
                <Icon
                  cursor="pointer"
                  as={ArrowUpRight}
                  boxSize={4}
                  color="brand.400"
                  m={5}
                  onClick={openDocsDrawer}
                />
              </HStack>
            </CardBody>
          </Card>
        </PopoverBody>
      </PopoverContent>
    </Popover>
  )
}
