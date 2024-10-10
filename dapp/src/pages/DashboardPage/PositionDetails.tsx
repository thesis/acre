import React from "react"
import { CurrencyBalanceWithConversion } from "#/components/shared/CurrencyBalanceWithConversion"
import { useBitcoinPosition, useTransactionModal } from "#/hooks"
import { ACTION_FLOW_TYPES } from "#/types"
import {
  Button,
  ButtonProps,
  Flex,
  HStack,
  // Tag,
  VStack,
} from "@chakra-ui/react"
import ArrivingSoonTooltip from "#/components/ArrivingSoonTooltip"
import UserDataSkeleton from "#/components/shared/UserDataSkeleton"
import { featureFlags } from "#/constants"
import { TextMd } from "#/components/shared/Typography"

const isWithdrawalFlowEnabled = featureFlags.WITHDRAWALS_ENABLED

const buttonStyles: ButtonProps = {
  size: "lg",
  flex: 1,
  maxW: "12.5rem", // 200px
  fontWeight: "bold",
  lineHeight: 6,
  px: 7,
  h: "auto",
}

export default function PositionDetails() {
  const { data } = useBitcoinPosition()
  const bitcoinAmount = data?.estimatedBitcoinBalance ?? 0n

  const openDepositModal = useTransactionModal(ACTION_FLOW_TYPES.STAKE)
  const openWithdrawModal = useTransactionModal(ACTION_FLOW_TYPES.UNSTAKE)

  return (
    <Flex w="100%" flexDirection="column" gap={5}>
      <VStack alignItems="start" spacing={0}>
        <TextMd fontWeight="bold">
          Acre balance
          {/* TODO: Uncomment when position will be implemented */}
          {/* {positionPercentage && (
            <Tag
              px={3}
              py={1}
              ml={2}
              borderWidth={0}
              color="gold.100"
              bg="gold.700"
              fontWeight="bold"
              lineHeight={5}
              verticalAlign="baseline"
            >
              Top {positionPercentage}%
            </Tag>
          )} */}
        </TextMd>
        <UserDataSkeleton>
          <VStack alignItems="start" spacing={0}>
            <CurrencyBalanceWithConversion
              from={{
                amount: bitcoinAmount,
                currency: "bitcoin",
                size: "4xl",
                letterSpacing: "-0.075rem", // -1.2px
                color: "grey.700",
              }}
              to={{
                currency: "usd",
                color: "grey.500",
                fontWeight: "medium",
              }}
            />
          </VStack>
        </UserDataSkeleton>
      </VStack>

      <HStack w="full" justify="start" flexWrap="wrap" spacing={2}>
        <UserDataSkeleton>
          <Button {...buttonStyles} onClick={openDepositModal}>
            Deposit
          </Button>
        </UserDataSkeleton>
        <UserDataSkeleton>
          <ArrivingSoonTooltip shouldDisplayTooltip={!isWithdrawalFlowEnabled}>
            <Button
              variant="outline"
              {...buttonStyles}
              onClick={openWithdrawModal}
              isDisabled={!isWithdrawalFlowEnabled}
            >
              Withdraw
            </Button>
          </ArrivingSoonTooltip>
        </UserDataSkeleton>
      </HStack>
    </Flex>
  )
}
