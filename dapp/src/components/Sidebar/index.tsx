import React from "react"
import {
  Box,
  Button,
  Icon,
  useMultiStyleConfig,
  Image,
  Card,
  CardBody,
  CardHeader,
  Stack,
  StackDivider,
  CardFooter,
  HStack,
  Link,
} from "@chakra-ui/react"
import RightSidebar from "../../assets/images/right-sidebar-bg.png"
import CoinsStackedIcon from "../../assets/images/coins-stacked.svg"
import ShieldPlusIcon from "../../assets/images/shield-plus.svg"
import { useDocsDrawer, useSidebar } from "../../hooks"
import { ArrowUpRight } from "../../static/icons"
import { TextMd, TextSm } from "../shared/Typography"

export default function Sidebar() {
  const { isOpen } = useSidebar()
  const { onOpen: openDocsDrawer } = useDocsDrawer()
  const styles = useMultiStyleConfig("Sidebar")

  return (
    <Box
      as="aside"
      mt="header_height"
      w={isOpen ? 80 : 0}
      __css={styles.sidebarContainer}
    >
      <Box __css={styles.sidebar}>
        <Button
          justifyContent="flex-start"
          leftIcon={<Icon as={ArrowUpRight} boxSize={6} />}
          onClick={openDocsDrawer}
          width="100%"
        >
          Docs
        </Button>
        <Card marginTop="12px" bg="gold.100" border="#ffffff solid">
          <CardHeader padding="0">
            <Image src={RightSidebar} alt="" width="282px" height="160px" />
          </CardHeader>

          <CardBody>
            <Stack divider={<StackDivider />} spacing="4">
              <Box>
                <TextMd alignSelf="stretch" fontWeight="bold">
                  Maximize your earnings by using tBTC to deposit and redeem BTC
                  in DeFi!
                </TextMd>
              </Box>
            </Stack>
          </CardBody>

          <CardFooter paddingTop="0">
            <Link href="https://#" isExternal>
              <TextSm>Read more</TextSm>
            </Link>
          </CardFooter>
        </Card>

        <Card marginTop="12px" bg="gold.100" border="#ffffff solid">
          <CardHeader>
            <TextMd fontWeight="bold">How we calculate fees</TextMd>
          </CardHeader>

          <CardBody paddingTop="0">
            <Stack divider={<StackDivider />} spacing="4">
              <Box>
                <HStack paddingBottom="16px">
                  <Image
                    alignSelf="baseline"
                    position="relative"
                    top="2px"
                    src={ShieldPlusIcon}
                    alt=""
                  />
                  <TextSm>
                    Fees is software empowered by the Threshold DAO.
                  </TextSm>
                </HStack>
                <HStack alignContent="flex-start">
                  <Image
                    alignSelf="baseline"
                    position="relative"
                    top="2px"
                    src={CoinsStackedIcon}
                    alt=""
                  />
                  <TextSm>
                    Fees is software empowered by the Threshold DAO.
                  </TextSm>
                </HStack>
              </Box>
            </Stack>
          </CardBody>
        </Card>

        <Button
          marginTop="12px"
          variant="outline"
          justifyContent="flex-start"
          leftIcon={<Icon as={ArrowUpRight} boxSize={6} color="brand.400" />}
          onClick={openDocsDrawer}
          width="100%"
          bg="gold.100"
          border="#ffffff solid"
        >
          FAQ
        </Button>

        <Button
          marginTop="12px"
          variant="outline"
          justifyContent="flex-start"
          leftIcon={<Icon as={ArrowUpRight} boxSize={6} color="brand.400" />}
          onClick={openDocsDrawer}
          width="100%"
          bg="gold.100"
          border="#ffffff solid"
        >
          Token Contract
        </Button>

        <Button
          marginTop="12px"
          variant="outline"
          justifyContent="flex-start"
          leftIcon={<Icon as={ArrowUpRight} boxSize={6} color="brand.400" />}
          onClick={openDocsDrawer}
          width="100%"
          bg="gold.100"
          border="#ffffff solid"
        >
          Bridge Contract
        </Button>
      </Box>
    </Box>
  )
}
