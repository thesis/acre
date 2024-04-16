import React, { useRef } from "react"
import { Box, VStack } from "@chakra-ui/react"
import seasonCountdownBackground from "#/assets/images/season-countdown-section-background.png"
import seasonCountdownForeground from "#/assets/images/season-countdown-section-foreground.png"
import {
  MotionValue,
  motion,
  useScroll,
  useSpring,
  useTransform,
  useTime,
} from "framer-motion"

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
  const seed = useTransform(time, (value) => Math.floor(value))

  return (
    <Box as="svg" ref={containerRef} w="full" h="full" pos="absolute" inset={0}>
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

function SeasonCountdownSection() {
  return (
    <VStack
      spacing={0}
      position="relative"
      minH={720}
      rounded="2xl"
      overflow="hidden"
    >
      <Background />
    </VStack>
  )
}

export default SeasonCountdownSection
