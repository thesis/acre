import React, { ComponentProps } from "react"
import {
  Box,
  Card,
  CardBody,
  Flex,
  useMultiStyleConfig,
  Image,
} from "@chakra-ui/react"
import { useSidebar } from "#/hooks"
import {
  EXTERNAL_HREF,
  REWARD_BOOST,
  SEASON_KEY,
  featureFlags,
} from "#/constants"
import { rewardsBoostArrowImage } from "#/assets/images/benefits"
import ButtonLink from "./shared/ButtonLink"
import { TextSm } from "./shared/Typography"

const BUTTONS: Partial<ComponentProps<typeof ButtonLink>>[] = [
  {
    children: "Docs",
    variant: "solid",
    href: EXTERNAL_HREF.DOCS,
    isExternal: true,
  },
  {
    children: "FAQ",
    colorScheme: "gold",
    href: EXTERNAL_HREF.FAQ,
    isExternal: true,
  },
  {
    children: "Contracts",
    colorScheme: "gold",
    href: EXTERNAL_HREF.CONTRACTS,
    isExternal: true,
  },
]

const BENEFITS = [
  { ...REWARD_BOOST, imageSrc: rewardsBoostArrowImage },
  SEASON_KEY,
].map((benefit) => ({ ...benefit, name: `1x ${benefit.name}` }))

export default function Sidebar() {
  const { isOpen } = useSidebar()
  // TODO Bring back when dApp embedded docs are ready
  // const { onOpen: openDocsDrawer } = useDocsDrawer()
  const styles = useMultiStyleConfig("Sidebar")

  return (
    <Box
      as="aside"
      mt="header_height"
      w={isOpen ? "sidebar_width" : "0"}
      __css={styles.sidebarContainer}
    >
      <Box __css={styles.sidebar}>
        {featureFlags.GAMIFICATION_ENABLED && (
          <>
            {/* TODO: Update the component when logic of losing rewards is ready */}
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

        {BUTTONS.map((buttonProps) => (
          <ButtonLink
            key={buttonProps.href}
            // onClick={openDocsDrawer}
            {...buttonProps}
          />
        ))}
      </Box>
    </Box>
  )
}
