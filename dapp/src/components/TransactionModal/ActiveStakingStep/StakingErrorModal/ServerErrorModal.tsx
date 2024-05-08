import React from "react"
import {
  Button,
  Flex,
  HStack,
  Icon,
  Link,
  ModalBody,
  ModalCloseButton,
  ModalFooter,
  ModalHeader,
  Tooltip,
} from "@chakra-ui/react"
import { CableWithPlugIcon, Info } from "#/assets/icons"
import { TextMd } from "#/components/shared/Typography"
import { EXTERNAL_HREF } from "#/constants"
import IconWrapper from "#/components/shared/IconWrapper"
import { MODAL_BASE_SIZE } from "#/components/shared/ModalBase"
import {
  IconBrandDiscordFilled,
  IconReload,
  IconServerBolt,
} from "@tabler/icons-react"

export default function ServerErrorModal({
  isLoading,
  retry,
}: {
  isLoading: boolean
  retry: () => void
}) {
  return (
    <>
      <ModalCloseButton />
      <ModalHeader color="red.400" textAlign="center">
        We&apos;re currently facing system issues.
      </ModalHeader>
      <ModalBody gap={10} pb={6}>
        <IconWrapper icon={CableWithPlugIcon} boxSize={32} color="red.400">
          <Icon as={IconServerBolt} boxSize={14} strokeWidth={1} />
        </IconWrapper>
        <TextMd>
          Your deposit didn&apos;t go through but no worries, your funds are
          safe.
        </TextMd>
        <Button
          as={Link}
          size="lg"
          width="100%"
          variant="outline"
          rightIcon={<Icon as={IconBrandDiscordFilled} boxSize={5} />}
          href={EXTERNAL_HREF.DISCORD}
          isExternal
        >
          Get help on Discord
        </Button>
      </ModalBody>
      <ModalFooter
        py={6}
        px={8}
        flexDirection="row"
        justifyContent="space-between"
        bgColor="gold.200"
        borderRadius="xl"
        // The dialog container style has padding set by default.
        // However, the modal footer should be positioned outside this padding.
        // To avoid changing it, let's set the position to relative and calculate the correct width.
        // To calculate the width we need to subtract the border width on two sides from the modal width.
        position="relative"
        w={`calc(var(--chakra-sizes-${MODAL_BASE_SIZE}) - 2 * var(--chakra-space-modal_borderWidth))`}
      >
        <Flex flexDirection="column">
          <HStack>
            <TextMd fontWeight="bold">System status</TextMd>
            {/* TODO: ADD a tooltip */}
            <Tooltip label="Tooltip text" placement="top">
              <Icon as={Info} boxSize={4} color="grey.400" />
            </Tooltip>
          </HStack>
          <TextMd color="red.400">Partial Outage</TextMd>
        </Flex>
        <Button
          // TODO: Use a loading button
          isLoading={isLoading}
          leftIcon={<Icon as={IconReload} boxSize={5} color="brand.400" />}
          variant="outline"
          onClick={retry}
        >
          Refresh
        </Button>
      </ModalFooter>
    </>
  )
}
