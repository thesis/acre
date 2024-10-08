import React, { useRef } from "react"
import { Box, BoxProps } from "@chakra-ui/react"
import { useSize } from "@chakra-ui/react-use-size"
import {
  MotionValue,
  motion,
  useScroll,
  useSpring,
  useTransform,
  useTime,
  wrap,
} from "framer-motion"
import seasonBackground from "#/assets/images/season-section-background.png"
import seasonForeground from "#/assets/images/season-section-foreground.png"

export function SeasonSectionBackground(props: BoxProps) {
  const containerRef = useRef(null)
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["center start", "start end"],
  })
  const smoothScrollYProgress = useSpring(scrollYProgress, {
    damping: 10,
    stiffness: 90,
    mass: 0.75,
  }) as MotionValue<number>
  const foregroundParallax = useTransform(
    smoothScrollYProgress,
    [0, 1],
    ["45%", "65%"],
  )
  const time = useTime()
  // Seed value is wrapped to prevent infinite increment causing potential memory leaks
  const seed = useTransform(time, (value) => wrap(0, 2137, Math.floor(value)))

  const size = useSize(containerRef)

  return (
    <Box as="svg" ref={containerRef} w="full" h="full" rounded="2xl" {...props}>
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
      <Box
        as="rect"
        x="0"
        y="0"
        style={{ width: size?.width }}
        h="full"
        fill="brand.400"
      />
      <Box as="g" mixBlendMode="overlay">
        <Box
          as="image"
          href={seasonBackground}
          style={{ width: size?.width }}
          h="full"
          preserveAspectRatio="xMinYMin slice"
        />
        <Box
          as={motion.image}
          href={seasonForeground}
          w="full"
          y={foregroundParallax}
          preserveAspectRatio="xMinYMin slice"
        />
      </Box>
      <Box
        as="rect"
        mixBlendMode="soft-light"
        // TOOD: Investigate width update delay
        style={{ width: size?.width }}
        h="full"
        fill="#0600ff"
        filter="url(#noise-filter)"
        opacity={0.64}
      />
    </Box>
  )
}
