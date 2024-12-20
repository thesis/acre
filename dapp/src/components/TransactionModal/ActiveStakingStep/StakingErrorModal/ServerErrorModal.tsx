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
  Text,
} from "@chakra-ui/react"
import { CableWithPlugIcon } from "#/assets/icons"
import { externalHref } from "#/constants"
import IconWrapper from "#/components/shared/IconWrapper"
import {
  IconBrandDiscordFilled,
  IconReload,
  IconServerBolt,
} from "@tabler/icons-react"
// import TooltipIcon from "#/components/shared/TooltipIcon"

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
        <Text size="md">
          Your deposit didn&apos;t go through but no worries, your funds are
          safe.
        </Text>
        <Button
          as={Link}
          size="lg"
          width="100%"
          variant="outline"
          rightIcon={<Icon as={IconBrandDiscordFilled} boxSize={5} />}
          href={externalHref.DISCORD}
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
      >
        <Flex flexDirection="column">
          <HStack>
            <Text size="md" fontWeight="bold">
              System status
            </Text>
            {/* TODO: ADD a tooltip */}
            {/* <TooltipIcon label="Tooltip text" placement="top" /> */}
          </HStack>
          <Text size="md" color="red.400">
            Partial Outage
          </Text>
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
