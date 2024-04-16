import React, { useRef } from "react"
import {
  Box,
  Tag,
  TagLabel,
  TagProps,
  VStack,
  Heading,
  Text,
} from "@chakra-ui/react"
import seasonCountdownBackground from "#/assets/images/season-countdown-section-background.png"
import seasonCountdownForeground from "#/assets/images/season-countdown-section-foreground.png"
import {
  MotionValue,
  motion,
  useScroll,
  useSpring,
  useTransform,
  useTime,
  wrap,
} from "framer-motion"
import { CountdownTimer } from "#/components/shared/CountdownTimer"

const MOCK_SEASON_DUE_TIMESTAMP = new Date(2024, 3, 20).getTime() / 1000

const MotionBox = motion(Box)

function Background() {
  const containerRef = useRef(null)
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["center start", "end end"],
  })
  const smoothScrollYProgress = useSpring(scrollYProgress, {
    damping: 10,
    stiffness: 90,
    mass: 0.75,
  }) as MotionValue<number>
  const foregroundParallax = useTransform(
    smoothScrollYProgress,
    [0, 1],
    ["25%", "65%"],
  )
  const time = useTime()
  // Seed value is wrapped to prevent infinite increment causing potential memory leaks
  const seed = useTransform(time, (value) => wrap(0, 2137, Math.floor(value)))

  return (
    <Box
      as="svg"
      ref={containerRef}
      w="full"
      h="full"
      minH={720}
      rounded="2xl"
      pos="absolute"
      inset={0}
      zIndex={-1}
    >
      <defs>
        <filter
          id="noise-filter"
          x="-20%"
          y="-20%"
          width="140%"
          height="140%"
          filterUnits="objectBoundingBox"
          primitiveUnits="userSpaceOnUse"
          colorInterpolationFilters="linearRGB"
        >
          <motion.feTurbulence
            type="fractalNoise"
            baseFrequency="0.119"
            numOctaves="4"
            seed={seed}
            stitchTiles="stitch"
            x="0%"
            y="0%"
            width="100%"
            height="100%"
            result="turbulence"
          />
          <feSpecularLighting
            surfaceScale="4"
            specularConstant="3"
            specularExponent="20"
            lightingColor="#0600ff"
            x="0%"
            y="0%"
            width="100%"
            height="100%"
            in="turbulence"
            result="specularLighting"
          >
            <feDistantLight azimuth="3" elevation="107" />
          </feSpecularLighting>
          <feColorMatrix
            type="saturate"
            values="0"
            x="0%"
            y="0%"
            width="100%"
            height="100%"
            in="specularLighting"
            result="colormatrix"
          />
        </filter>
      </defs>
      <Box as="rect" x="0" y="0" w="full" h="full" fill="brand.400" />
      <Box as="g" mixBlendMode="overlay">
        <Box
          as="image"
          href={seasonCountdownBackground}
          w="full"
          h="full"
          preserveAspectRatio="xMidYMin slice"
        />
        <Box
          as={motion.image}
          href={seasonCountdownForeground}
          w="full"
          h="full"
          preserveAspectRatio="xMinYMin slice"
          y={foregroundParallax}
        />
      </Box>
      <Box
        as="rect"
        mixBlendMode="soft-light"
        w="full"
        h="full"
        fill="#0600ff"
        filter="url(#noise-filter)"
        opacity={0.64}
      />
    </Box>
  )
}

function LiveTag(props: TagProps) {
  return (
    <Tag
      px={4}
      py={2}
      rounded="3xl"
      bg="grey.700"
      variant="solid"
      pos="relative"
      {...props}
    >
      <Box rounded="full" w={2} h={2} mr={3} bg="brand.400" />
      <MotionBox
        pos="absolute"
        rounded="full"
        w={2}
        h={2}
        bg="brand.400"
        animate={{ scale: [1, 6], opacity: [0.5, 0] }}
        transition={{
          duration: 2,
          ease: "easeInOut",
          repeat: Infinity,
        }}
      />
      <TagLabel
        color="gold.200"
        textTransform="uppercase"
        fontStyle="italic"
        overflow="visible"
        fontSize="md"
        lineHeight={5}
        fontWeight="bold"
      >
        Live
      </TagLabel>
    </Tag>
  )
}

function SeasonCountdownSection() {
  return (
    <Box position="relative">
      <VStack
        spacing={0}
        px={10}
        pt={15}
        pb={30}
        textAlign="center"
        color="white"
      >
        <LiveTag mb={10} />
        <Heading fontSize="5xl" fontWeight="bold" mb={4}>
          Season 1. Pre-launch staking
        </Heading>
        <Text fontSize="lg" fontWeight="medium" mb={10}>
          Season 1 users that stake bitcoin before Acre launches earn the <br />
          highest rewards and first access to upcoming Seasons.
        </Text>
        <CountdownTimer timestamp={MOCK_SEASON_DUE_TIMESTAMP} />
      </VStack>
      <Background />
    </Box>
  )
}

export default SeasonCountdownSection
