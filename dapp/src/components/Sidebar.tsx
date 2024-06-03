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
import {
  MYSTERY_BOX,
  REWARD_BOOST,
  SEASON_KEY,
  featureFlags,
} from "#/constants"
import { rewardsBoostArrowImage } from "#/assets/images/benefits"
import ButtonLink from "./shared/ButtonLink"
import { TextSm } from "./shared/Typography"

const BUTTONS = [
  { label: "Docs", variant: "solid" },
  { label: "FAQ", colorScheme: "gold" },
  { label: "Token Contract", colorScheme: "gold" },
  { label: "Bridge Contract", colorScheme: "gold" },
]

const BENEFITS = [
  { ...REWARD_BOOST, imageSrc: rewardsBoostArrowImage },
  MYSTERY_BOX,
  SEASON_KEY,
].map((benefit) => ({ ...benefit, name: `1x ${benefit.name}` }))

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
        {featureFlags.SUPPORT_GAMIFICATION && (
          <>
            <TextSm fontWeight="bold">Rewards you’ll unlock</TextSm>
            <Flex mt={2} mb={7} flexDir="column" gap={2}>
              {BENEFITS.map(({ name, imageSrc }) => (
                <Card
                  key={name}
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
                    <TextSm fontWeight="semibold">{name}</TextSm>
                    <Image src={imageSrc} boxSize="3.75rem" />
                  </CardBody>
                </Card>
              ))}
            </Flex>
          </>
        )}

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
