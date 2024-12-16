import React from "react"
import { useMobileMode } from "#/hooks"
import {
  Box,
  BoxProps,
  Button,
  Flex,
  Icon,
  Link,
  useDisclosure,
} from "@chakra-ui/react"
import { IconChevronDown } from "@tabler/icons-react"
import { AnimatePresence, motion } from "framer-motion"
import { EXTERNAL_HREF } from "#/constants"
import { LiveTag } from "../shared/LiveTag"
import { H4, TextMd, TextXl } from "../shared/Typography"
import AcreAnimatedBadge from "./AcreAnimatedBadge"

const MotionIcon = motion(Icon)
const MotionBox = motion(Box)

type MobileModeBannerProps = BoxProps & {
  forceOpen?: boolean
}

function MobileModeBanner(props: MobileModeBannerProps) {
  const { forceOpen = false, ...restProps } = props

  const isMobileMode = useMobileMode()

  const { isOpen: isBannerOpen, onToggle: handleBannerOpen } = useDisclosure({
    defaultIsOpen: forceOpen,
  })

  if (!isMobileMode) return null

  return (
    <Box
      order="-1"
      position={isBannerOpen ? "sticky" : "relative"}
      top={0}
      w="full"
      zIndex="mobileBanner"
      maxH="100vh"
      {...restProps}
    >
      <Flex align="center" justify="center" p={4} bg="grey.700">
        <TextMd color="gold.300" textAlign="center" whiteSpace="break-spaces">
          Acre App is <LiveTag color="brand.400" gap={1} px={1} py={0} /> on
          desktop!
        </TextMd>

        {!forceOpen && (
          <Button
            onClick={handleBannerOpen}
            variant="ghost"
            rightIcon={
              <MotionIcon
                as={IconChevronDown}
                boxSize={5}
                animate={{ rotate: isBannerOpen ? -180 : 0 }}
              />
            }
            iconSpacing={0}
            color="brand.400"
            p={0}
            h="auto"
            ml={2}
          >
            <TextMd>Info</TextMd>
          </Button>
        )}
      </Flex>

      <AnimatePresence>
        {(forceOpen || isBannerOpen) && (
          <MotionBox
            initial={forceOpen ? false : { height: 0 }}
            animate={{ height: "100vh" }}
            exit={{ height: 0 }}
            w="full"
            overflow="hidden"
          >
            <Box
              h="full"
              bg="grey.700"
              color="gold.300"
              px={5}
              py={8}
              textAlign="center"
            >
              <AcreAnimatedBadge mx="auto" mb={12} boxSize={44} />

              <H4 mb={9} fontWeight="500">
                Acre App live only on desktop for now. We&apos;re working with
                partners to bring it to mobile soon.
              </H4>

              <TextXl lineHeight={9}>
                Stay tuned on{" "}
                <Link
                  textDecoration="underline"
                  href={EXTERNAL_HREF.X}
                  isExternal
                >
                  X
                </Link>{" "}
                and join our{" "}
                <Link
                  textDecoration="underline"
                  href={EXTERNAL_HREF.DISCORD}
                  isExternal
                >
                  Discord
                </Link>
                . We would love to hear from you.
              </TextXl>
            </Box>
          </MotionBox>
        )}
      </AnimatePresence>
    </Box>
  )
}

export default MobileModeBanner
