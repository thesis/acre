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
} from "@chakra-ui/react"
import { CableWithPlugIcon } from "#/assets/icons"
import { TextMd } from "#/components/shared/Typography"
import { EXTERNAL_HREF } from "#/constants"
import IconWrapper from "#/components/shared/IconWrapper"
import {
  IconBrandDiscordFilled,
  IconReload,
  IconServerBolt,
} from "@tabler/icons-react"
// import InfoTooltip from "#/components/shared/InfoTooltip"

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
      >
        <Flex flexDirection="column">
          <HStack>
            <TextMd fontWeight="bold">System status</TextMd>
            {/* TODO: ADD a tooltip */}
            {/* <InfoTooltip label="Tooltip text" placement="top" /> */}
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
