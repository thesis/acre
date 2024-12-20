import React from "react"
import {
  Button,
  Flex,
  HStack,
  Icon,
  ModalBody,
  ModalCloseButton,
  ModalFooter,
  ModalHeader,
} from "@chakra-ui/react"
import { CableWithPlugIcon } from "#/assets/icons"
import { TextMd } from "#/components/shared/Typography"
import { externalHref } from "#/constants"
import IconWrapper from "#/components/shared/IconWrapper"
import {
  IconBrandDiscordFilled,
  IconReload,
  IconServerBolt,
} from "@tabler/icons-react"
import LinkButton from "#/components/shared/LinkButton"
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
      <ModalHeader color="red.50" textAlign="center">
        We&apos;re currently facing system issues.
      </ModalHeader>
      <ModalBody gap={10} pb={6}>
        <IconWrapper icon={CableWithPlugIcon} boxSize={32} color="red.50">
          <Icon as={IconServerBolt} boxSize={14} strokeWidth={1} />
        </IconWrapper>
        <TextMd>
          Your deposit didn&apos;t go through but no worries, your funds are
          safe.
        </TextMd>
        <LinkButton
          size="lg"
          width="100%"
          variant="outline"
          rightIcon={<Icon as={IconBrandDiscordFilled} boxSize={5} />}
          href={externalHref.DISCORD}
          isExternal
        >
          Get help on Discord
        </LinkButton>
      </ModalBody>
      <ModalFooter
        py={6}
        px={8}
        flexDirection="row"
        justifyContent="space-between"
        bgColor="surface.3"
        borderRadius="xl"
      >
        <Flex flexDirection="column">
          <HStack>
            <TextMd fontWeight="bold">System status</TextMd>
            {/* TODO: ADD a tooltip */}
            {/* <TooltipIcon label="Tooltip text" placement="top" /> */}
          </HStack>
          <TextMd color="red.50">Partial Outage</TextMd>
        </Flex>
        <Button
          isLoading={isLoading}
          leftIcon={<Icon as={IconReload} boxSize={5} color="acre.50" />}
          variant="outline"
          onClick={retry}
        >
          Refresh
        </Button>
      </ModalFooter>
    </>
  )
}
