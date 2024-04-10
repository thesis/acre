import React, { useMemo } from "react"
import {
  Box,
  Button,
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

export default function RetryModal({ retry }: { retry: () => void }) {
  const retryTimestamp = useMemo(
    () =>
      getExpirationTimestamp(ONE_MINUTE_IN_SECONDS * ONE_SEC_IN_MILLISECONDS),
    [],
  )
  const { minutes, seconds } = useCountdown(retryTimestamp, true, retry)

  const { label, progressPercent } = getCounterData(minutes, seconds)

  return (
    <>
      <ModalHeader color="red.400">Oops! There was an error.</ModalHeader>
      <ModalBody gap={10} pt={4}>
        <IconWrapper icon={CableWithPlugIcon} boxSize={32} color="red.400">
          <Icon as={IconX} color="red.400" boxSize={14} strokeWidth={1} />
        </IconWrapper>
        <TextMd>
          Your deposit didn&apos;t go through but no worries, your funds are
          safe.
        </TextMd>
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
      </ModalBody>
      <ModalFooter mt={4}>
        <Button size="lg" width="100%" onClick={retry}>
          Retry
        </Button>
        <HStack>
          <Icon as={IconShieldCheckFilled} boxSize={5} color="gold.700" />
          <TextSm color="grey.700">Your funds are secure.</TextSm>
        </HStack>
      </ModalFooter>
    </>
  )
}
