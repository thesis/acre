import React from "react"
import {
  Box,
  Icon,
  useMultiStyleConfig,
  Image,
  Card,
  CardBody,
  CardHeader,
  CardFooter,
  HStack,
  Link,
} from "@chakra-ui/react"
import RightSidebar from "#/assets/images/right-sidebar-bg.png"
import { useSidebar, useDocsDrawer } from "#/hooks"
import { ShieldPlusIcon } from "#/static/icons"
import { TextMd, TextSm } from "../shared/Typography"
import ButtonLink from "../shared/ButtonLink"

const readMoreEarnings = "https://#"

const BUTTONS = [
  { label: "FAQ" },
  { label: "Token Contract" },
  { label: "Bridge Contract" },
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
        <ButtonLink label="Docs" variant="solid" onClick={openDocsDrawer} />
        <Card variant="light" mt={3}>
          <CardHeader padding="0">
            <Image src={RightSidebar} alt="" width="70.5" height="40" />
          </CardHeader>

          <CardBody>
            <TextMd alignSelf="stretch" fontWeight="bold">
              Maximize your earnings by using tBTC to deposit and redeem BTC in
              DeFi!
            </TextMd>
          </CardBody>

          <CardFooter paddingTop="0">
            <Link href={readMoreEarnings} isExternal>
              <TextSm>Read more</TextSm>
            </Link>
          </CardFooter>
        </Card>

        <Card variant="light" mt={3}>
          <CardHeader>
            <TextMd fontWeight="bold">How we calculate fees</TextMd>
          </CardHeader>

          <CardBody paddingTop="0">
            <HStack gap="1">
              <Icon as={ShieldPlusIcon} w={5} h={5} alignSelf="baseline" />
              <TextSm>Fees is software empowered by the Threshold DAO.</TextSm>
            </HStack>
          </CardBody>
        </Card>

        {BUTTONS.map(({ label }) => (
          <ButtonLink label={label} onClick={openDocsDrawer} marginTop={3} />
        ))}
      </Box>
    </Box>
  )
}
