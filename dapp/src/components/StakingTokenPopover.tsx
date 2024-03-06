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
} from "@chakra-ui/react"
import { CurrencyBalanceWithConversion } from "./shared/CurrencyBalanceWithConversion"
import { TextLg, TextMd } from "./shared/Typography"

export function StakingTokenPopover() {
  return (
    <Popover>
      <PopoverTrigger>
        <Icon as={Info} color="grey.700" />
      </PopoverTrigger>
      <PopoverContent
        borderRadius="xl"
        bg="gold.100"
        borderWidth={0.5}
        borderColor="white"
        p={5}
      >
        <PopoverCloseButton top={6} right={6} />
        <PopoverBody p={0}>
          <TextLg fontWeight="bold">Liquid staking token</TextLg>
          <CurrencyBalanceWithConversion
            from={{
              amount: 912312331,
              variant: "greater-balance-xl",
              currency: "stbtc",
              size: "4xl",
            }}
            to={{ currency: "usd" }}
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
                <TextMd m={5}>
                  Your tokens are this Ethereum address once the staking
                  transaction is co...
                </TextMd>
                <Icon m={5} as={ArrowUpRight} boxSize={4} color="brand.400" />
              </HStack>
            </CardBody>
          </Card>
        </PopoverBody>
      </PopoverContent>
    </Popover>
  )
}
