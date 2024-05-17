import React from "react"
import {
  Box,
  Card,
  CardBody,
  Flex,
  useMultiStyleConfig,
  Image,
} from "@chakra-ui/react"
import { useSidebar, useDocsDrawer } from "#/hooks"
import rewardsBoostArrow from "#/assets/images/rewards-boost-arrow.svg"
import mysteryBoxIcon from "#/assets/images/mystery-box.svg"
import seasonKeyIcon from "#/assets/images/season-key.svg"
import ButtonLink from "./shared/ButtonLink"
import { TextSm } from "./shared/Typography"

const BUTTONS = [
  { label: "Docs", variant: "solid" },
  { label: "FAQ", colorScheme: "gold" },
  { label: "Token Contract", colorScheme: "gold" },
  { label: "Bridge Contract", colorScheme: "gold" },
]

const BENEFITS = [
  { label: "1x Rewards Boost", iconSrc: rewardsBoostArrow },
  { label: "1x Mystery Box", iconSrc: mysteryBoxIcon },
  { label: "1x Season Key", iconSrc: seasonKeyIcon },
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
          {BENEFITS.map(({ label, iconSrc }) => (
            <Card
              key={label}
              bg="gold.300"
              borderWidth="1px"
              borderColor="white"
            >
              <CardBody
                display="flex"
                flexDirection="row"
                justifyContent="space-between"
                alignItems="center"
                py={0}
                px={4}
              >
                <TextSm fontWeight="semibold">{label}</TextSm>
                <Image src={iconSrc} boxSize="3.75rem" />
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
