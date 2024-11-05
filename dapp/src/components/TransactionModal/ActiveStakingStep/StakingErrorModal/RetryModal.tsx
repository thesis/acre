import React, { useMemo } from "react"
import {
  Box,
  Button,
  Flex,
  HStack,
  Icon,
  ModalBody,
  ModalFooter,
  ModalHeader,
} from "@chakra-ui/react"
import { CableWithPlugIcon } from "#/assets/icons"
import { TextMd, TextSm } from "#/components/shared/Typography"
import IconWrapper from "#/components/shared/IconWrapper"
import { getExpirationTimestamp, getPercentValue } from "#/utils"
import { useCountdown } from "#/hooks"
import { ONE_MINUTE_IN_SECONDS, ONE_SEC_IN_MILLISECONDS } from "#/constants"
import { IconShieldCheckFilled, IconX } from "@tabler/icons-react"
import Skeleton from "#/components/shared/Skeleton"

const getCounterData = (minutes: string, seconds: string) => {
  const isLessThanMinute = parseInt(minutes, 10) <= 0

  const progressPercent = `${
    isLessThanMinute
      ? getPercentValue(parseInt(seconds, 10), ONE_MINUTE_IN_SECONDS)
      : 100
  }%`
  const label = `${isLessThanMinute ? "0" : "1"}:${seconds}`

  return { label, progressPercent }
}

export default function RetryModal({
  isLoading,
  retry,
}: {
  isLoading: boolean
  retry: () => void
}) {
  const retryTimestamp = useMemo(
    () =>
      getExpirationTimestamp(ONE_MINUTE_IN_SECONDS * ONE_SEC_IN_MILLISECONDS),
    [],
  )
  const { minutes, seconds } = useCountdown(retryTimestamp, true, retry)

  const { label, progressPercent } = getCounterData(minutes, seconds)

  return (
    <>
      <ModalHeader as={Flex} color="red.400" justifyContent="center">
        <Skeleton isLoaded={!isLoading} w="fit-content">
          Oops! There was an error.
        </Skeleton>
      </ModalHeader>
      <ModalBody gap={10} pt={2} pb={6}>
        <Skeleton isLoaded={!isLoading} borderRadius="50%">
          <IconWrapper icon={CableWithPlugIcon} boxSize={32} color="red.400">
            <Icon as={IconX} color="red.400" boxSize={14} strokeWidth={1} />
          </IconWrapper>
        </Skeleton>
        <Flex flexDirection="column" alignItems="center">
          <Skeleton isLoaded={!isLoading}>
            <TextMd>No worries—your funds are safe.</TextMd>
          </Skeleton>
          <Skeleton isLoaded={!isLoading} mt={2}>
            <TextMd>
              An error occurred while processing your transaction.
            </TextMd>
          </Skeleton>
        </Flex>
        {isLoading ? (
          <TextMd fontWeight="semibold">Retrying transaction...</TextMd>
        ) : (
          <HStack gap={1}>
            <TextMd>Auto-retry in</TextMd>
            <TextMd fontWeight="bold" textAlign="left" minW={10}>
              {label}
            </TextMd>
            <Box
              w={3}
              h={3}
              aspectRatio={1}
              borderRadius="50%"
              background={`conic-gradient(var(--chakra-colors-brand-400) ${progressPercent}, transparent 0)`}
              transition="background"
            />
            <Box />
          </HStack>
        )}
      </ModalBody>
      <ModalFooter pt={0} pb={8}>
        <Button size="lg" width="100%" onClick={retry} isLoading={isLoading}>
          Retry transaction
        </Button>
        <HStack>
          <Icon as={IconShieldCheckFilled} boxSize={5} color="gold.700" />
          <TextSm color="grey.700">Your funds are secure.</TextSm>
        </HStack>
      </ModalFooter>
    </>
  )
}
