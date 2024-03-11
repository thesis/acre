import React from "react"
import { ArrowUpRight } from "#/assets/icons"
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
  Box,
  PopoverProps,
} from "@chakra-ui/react"
import { CardSizeType } from "#/types"
import { CurrencyBalanceWithConversion } from "./shared/CurrencyBalanceWithConversion"
import { TextMd, TextSm } from "./shared/Typography"

type StakingTokenPopoverProps = PopoverProps & { cardSize: CardSizeType }

export function StakingTokenPopover({
  cardSize,
  ...props
}: StakingTokenPopoverProps) {
  return (
    <Popover {...props}>
      <PopoverTrigger>
        <Box position="absolute" w={0} top={-2} right={-4} />
      </PopoverTrigger>
      <PopoverContent
        borderRadius="xl"
        bg="gold.100"
        borderWidth={0.5}
        borderColor="white"
        p={5}
        width={cardSize.width + 15}
        height={cardSize.height}
      >
        <PopoverCloseButton
          top={6}
          right={6}
          _hover={{ backgroundColor: undefined }}
        />
        <PopoverBody p={0}>
          <TextMd fontWeight="bold">Liquid staking token</TextMd>
          <CurrencyBalanceWithConversion
            from={{
              amount: "912312331",
              variant: "greater-balance-xl",
              currency: "stbtc",
              size: "4xl",
            }}
            to={{ currency: "usd", color: "#675E60" }}
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
                  transaction is co...
                </TextSm>
                <Icon as={ArrowUpRight} boxSize={4} color="brand.400" m={5} />
              </HStack>
            </CardBody>
          </Card>
        </PopoverBody>
      </PopoverContent>
    </Popover>
  )
}
