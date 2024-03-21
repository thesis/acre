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
import {
  CableWithPlugIcon,
  DiscordIcon,
  Info,
  ReloadIcon,
  ServerIcon,
} from "#/assets/icons"
import { TextMd } from "#/components/shared/Typography"
import { EXTERNAL_HREF } from "#/constants"
import IconWrapper from "#/components/shared/IconWrapper"

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
      <ModalHeader color="red.400">
        We&apos;re currently facing system issues.
      </ModalHeader>
      <ModalBody gap={10} pt={4}>
        <IconWrapper icon={CableWithPlugIcon} boxSize={32} color="red.400">
          <ServerIcon boxSize={14} />
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
          rightIcon={<DiscordIcon />}
          href={EXTERNAL_HREF.DISCORD}
          isExternal
        >
          Get help on Discord
        </Button>
      </ModalBody>
      <ModalFooter
        mt={4}
        py={6}
        px={8}
        flexDirection="row"
        justifyContent="space-between"
        bgColor="gold.200"
        borderRadius="xl"
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
          leftIcon={<ReloadIcon boxSize={5} color="brand.400" />}
          variant="outline"
          onClick={retry}
        >
          Refresh
        </Button>
      </ModalFooter>
    </>
  )
}
