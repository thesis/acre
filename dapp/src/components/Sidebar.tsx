import React from "react"
import {
  Box,
  Card,
  CardBody,
  Flex,
  useMultiStyleConfig,
} from "@chakra-ui/react"
import { useSidebar, useDocsDrawer } from "#/hooks"
import { TextSm } from "./shared/Typography"
import ButtonLink from "./shared/ButtonLink"

const BUTTONS = [
  { label: "Docs", variant: "solid" },
  { label: "FAQ", colorScheme: "gold" },
  { label: "Token Contract", colorScheme: "gold" },
  { label: "Bridge Contract", colorScheme: "gold" },
]

const BENEFITS = [
  { label: "1x Rewards Boost", icon: undefined },
  { label: "1x Mystery Box", icon: undefined },
  { label: "1x Season Key", icon: undefined },
]

export default function Sidebar() {
  const { isOpen } = useSidebar()
  const { onOpen: openDocsDrawer } = useDocsDrawer()
  const styles = useMultiStyleConfig("Sidebar")

  return (
    <Box
      as="aside"
      mt="header_height"
      w={isOpen ? "sidebar_width" : "0"}
      __css={styles.sidebarContainer}
    >
      <Box __css={styles.sidebar}>
        <TextSm fontWeight="bold">Rewards you’ll unlock</TextSm>

        <Flex mt={2} mb={7} flexDir="column" gap={2}>
          {BENEFITS.map(({ label }) => (
            <Card
              key={label}
              bg="gold.300"
              borderWidth="1px"
              borderColor="white"
            >
              <CardBody px={4} py={5}>
                <TextSm fontWeight="semibold">{label}</TextSm>
                {/* TODO: Add a correct icon */}
              </CardBody>
            </Card>
          ))}
        </Flex>

        {BUTTONS.map(({ label, variant, colorScheme }) => (
          <ButtonLink
            key={label}
            onClick={openDocsDrawer}
            variant={variant}
            colorScheme={colorScheme}
          >
            {label}
          </ButtonLink>
        ))}
      </Box>
    </Box>
  )
}
