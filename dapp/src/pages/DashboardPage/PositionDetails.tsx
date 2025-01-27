import React from "react"
import CurrencyBalanceWithConversion from "#/components/shared/CurrencyBalanceWithConversion"
import {
  useActivitiesCount,
  useBitcoinPosition,
  useTransactionModal,
  useStatistics,
  useWallet,
  useMobileMode,
  useActivities,
} from "#/hooks"
import { ACTION_FLOW_TYPES } from "#/types"
import {
  Button,
  ButtonProps,
  Flex,
  HStack,
  VStack,
  Text,
} from "@chakra-ui/react"
import ArrivingSoonTooltip from "#/components/ArrivingSoonTooltip"
import UserDataSkeleton from "#/components/shared/UserDataSkeleton"
import { featureFlags } from "#/constants"
import { IconClockHour5Filled } from "@tabler/icons-react"
import TooltipIcon from "#/components/shared/TooltipIcon"
import { activitiesUtils } from "#/utils"
import AcreTVLMessage from "./AcreTVLMessage"

const isWithdrawalFlowEnabled = featureFlags.WITHDRAWALS_ENABLED

const buttonStyles: ButtonProps = {
  size: "lg",
  w: 40,
}

export default function PositionDetails() {
  const { data: bitcoinPosition } = useBitcoinPosition()
  const bitcoinAmount = bitcoinPosition?.estimatedBitcoinBalance ?? 0n

  const openDepositModal = useTransactionModal(ACTION_FLOW_TYPES.STAKE)
  const openWithdrawModal = useTransactionModal(ACTION_FLOW_TYPES.UNSTAKE)
  const activitiesCount = useActivitiesCount()
  const { data: activities } = useActivities()
  const isMobileMode = useMobileMode()

  const { tvl } = useStatistics()

  const { isConnected } = useWallet()

  const isDisabledForMobileMode =
    isMobileMode && !featureFlags.MOBILE_MODE_ENABLED

  return (
    <Flex w="100%" flexDirection="column" gap={5}>
      <VStack alignItems="start" spacing={0}>
        {/* TODO: Component should be moved to `CardHeader` */}
        <HStack>
          <Text size="md">Your Acre balance</Text>
          {activitiesUtils.hasPendingDeposits(activities ?? []) && (
            <TooltipIcon
              icon={IconClockHour5Filled}
              label="Your balance will update once the pending deposit is finalized."
              placement="right"
            />
          )}
        </HStack>
        <UserDataSkeleton>
          <VStack alignItems="start" spacing={0}>
            <CurrencyBalanceWithConversion
              from={{
                amount: bitcoinAmount,
                currency: "bitcoin",
                size: "4xl",
                letterSpacing: "-0.075rem", // -1.2px
                color: "text.primary",
              }}
              to={{
                currency: "usd",
                color: "text.tertiary",
                fontWeight: "medium",
              }}
            />
          </VStack>
        </UserDataSkeleton>
      </VStack>

      <HStack w="full" justify="start" flexWrap="wrap" spacing={5}>
        <UserDataSkeleton>
          <ArrivingSoonTooltip
            label="This option is not available on mobile yet. Please use the desktop app to deposit."
            shouldDisplayTooltip={isDisabledForMobileMode}
          >
            <Button
              {...buttonStyles}
              onClick={openDepositModal}
              isDisabled={
                (featureFlags.TVL_ENABLED && tvl.isCapExceeded) ||
                isDisabledForMobileMode
              }
            >
              Deposit
            </Button>
          </ArrivingSoonTooltip>
        </UserDataSkeleton>
        {isConnected && activitiesCount > 0 && (
          <UserDataSkeleton>
            <ArrivingSoonTooltip
              label={
                isMobileMode
                  ? "This option is not available on mobile yet. Please use the desktop app to withdraw."
                  : "This option is currently not available."
              }
              shouldDisplayTooltip={
                !isWithdrawalFlowEnabled || isDisabledForMobileMode
              }
            >
              <Button
                variant="outline"
                {...buttonStyles}
                onClick={openWithdrawModal}
                isDisabled={!isWithdrawalFlowEnabled || isDisabledForMobileMode}
              >
                Withdraw
              </Button>
            </ArrivingSoonTooltip>
          </UserDataSkeleton>
        )}
        {featureFlags.TVL_ENABLED && <AcreTVLMessage />}
      </HStack>
    </Flex>
  )
}
