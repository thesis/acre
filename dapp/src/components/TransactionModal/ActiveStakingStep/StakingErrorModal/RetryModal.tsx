import React, { useMemo } from "react"
import {
  Box,
  Button,
  CloseButton,
  HStack,
  Icon,
  ModalBody,
  ModalFooter,
  ModalHeader,
} from "@chakra-ui/react"
import { CableWithPlugIcon } from "#/assets/icons"
import { TextMd, TextSm } from "#/components/shared/Typography"
import IconWrapper from "#/components/shared/IconWrapper"
import { dateToUnixTimestamp } from "#/utils"
import { useCountdown } from "#/hooks"
import { ONE_MINUTE_IN_SECONDS, ONE_SEC_IN_MILLISECONDS } from "#/constants"
import { IconShieldCheckFilled, IconX } from "@tabler/icons-react"

const getRetryTimestamp = () => {
  const today = new Date()
  const retryDate = new Date(
    today.getTime() + ONE_MINUTE_IN_SECONDS * ONE_SEC_IN_MILLISECONDS,
  )

  return dateToUnixTimestamp(retryDate)
}

const getProgressPercent = (seconds: string) =>
  ((ONE_MINUTE_IN_SECONDS - parseInt(seconds, 10)) * 100) /
  ONE_MINUTE_IN_SECONDS

export default function RetryModal({ retry }: { retry: () => void }) {
  const retryTimestamp = useMemo(() => getRetryTimestamp(), [])
  const data = useCountdown(retryTimestamp, true)

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
          <TextMd
            fontWeight="bold"
            textAlign="left"
            minW={9}
          >{`0:${data.seconds}`}</TextMd>
          <Box
            w={3}
            h={3}
            aspectRatio={1}
            borderRadius="50%"
            background={`conic-gradient(transparent ${getProgressPercent(
              data.seconds,
            )}%, var(--chakra-colors-brand-400) 0)`}
            transform="scaleX(-1)"
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
