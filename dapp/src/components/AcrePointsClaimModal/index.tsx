import React, { ReactNode, useEffect, useMemo } from "react"
import { useAcrePoints } from "#/hooks"
import { Box, ModalBody, Text, VStack } from "@chakra-ui/react"
import {
  AnimationSequence,
  motion,
  Transition,
  useAnimate,
  useMotionValue,
} from "framer-motion"
import { acrePoints as acrePointsUtils } from "#/utils"
import withBaseModal from "../ModalRoot/withBaseModal"
import { TextXl } from "../shared/Typography"
import { AnimatedNumber } from "../shared/AnimatedNumber"
import ArrowAnimatedBackground from "./ArrowAnimatedBackground"

const { getFormattedAmount } = acrePointsUtils

const MotionVStack = motion(VStack)

const INITIAL_CONTAINER_HEIGHT = 214
const CONTAINER_HEIGHT = 288
const VALUE_SCALE = 0.375
const STEP_HEIGHT = CONTAINER_HEIGHT * (1 - VALUE_SCALE)
const STEP_SPACING = 32
const TRANSITION: Transition = {
  type: "spring",
  damping: 14,
  stiffness: 86,
  delay: 2, // step duration
}

const getStepOffsets = (
  stepCount: number,
  stepHeight: number,
  spacing: number,
) =>
  Array(stepCount - 1)
    .fill(0)
    .map((_, index) =>
      index === 0
        ? -stepHeight
        : (index + 1) * -stepHeight - spacing * 2 ** index,
    )

export function AcrePointsClaimModalBase() {
  const { claimablePointsAmount, totalPointsAmount } = useAcrePoints()

  const formattedClaimablePointsAmount = getFormattedAmount(
    claimablePointsAmount,
  )
  const formattedUpdatedPointsAmount = getFormattedAmount(
    claimablePointsAmount + totalPointsAmount,
  )

  const steps = useMemo<[string, ReactNode][]>(
    () => [
      [
        "You earned",
        <AnimatedNumber
          value={formattedClaimablePointsAmount}
          prefix="+"
          suffix=" PTS"
          animateMode="whileInView"
          color="brand.400"
        />,
      ],
      [
        "Updating points balance...",
        <AnimatedNumber
          value={formattedUpdatedPointsAmount}
          suffix=" PTS"
          animateMode="whileInView"
          indicationColor="brand.400"
        />,
      ],
      // [
      //   "Calculating rank...",
      //   <AnimatedNumber
      //     value={rankPositionDifference}
      //     prefix={rankPositionDifference > 0 ? "+" : "-"}
      //     animateMode="whileInView"
      //     color={rankPositionDifference > 0 ? "green.500" : "red.500"}
      //   />,
      // ],
      // [
      //   "Updating rank...",
      //   <AnimatedNumber
      //     value={estimatedRankPosition}
      //     prefix="#"
      //     animateMode="whileInView"
      //     indicationColor="brand.400"
      //   />,
      // ],
    ],
    [formattedClaimablePointsAmount, formattedUpdatedPointsAmount],
  )

  const containerHeight = useMotionValue(INITIAL_CONTAINER_HEIGHT)
  const [scope, animate] = useAnimate()

  useEffect(() => {
    const offsets = getStepOffsets(steps.length, STEP_HEIGHT, STEP_SPACING)
    const valueElements = [
      ...(scope.current as HTMLElement).querySelectorAll("[data-step-value]"),
    ].slice(0, -1)

    const sequence = [
      ["[data-steps-list]", { y: offsets[0] }, TRANSITION],
      [containerHeight, CONTAINER_HEIGHT, { at: "<", ...TRANSITION }],
      [valueElements[0], { scale: VALUE_SCALE }, { at: "<", ...TRANSITION }],
      ["[data-steps-list]", { y: offsets[1] }, TRANSITION],
      [valueElements[1], { scale: VALUE_SCALE }, { at: "<", ...TRANSITION }],
      ["[data-steps-list]", { y: offsets[2] }, TRANSITION],
      [valueElements[2], { scale: VALUE_SCALE }, { at: "<", ...TRANSITION }],
    ] as AnimationSequence

    const handleAnimation = async () => {
      await animate(sequence)
    }

    // eslint-disable-next-line no-void
    void handleAnimation()
  }, [scope, animate, containerHeight, steps])

  return (
    <ModalBody gap={0} p={0}>
      <Box py={6} ref={scope}>
        <MotionVStack
          spacing={STEP_SPACING / 4} // to get 8th token value -> 32px
          data-steps-list
          style={{ height: containerHeight }}
        >
          {steps.map(([currentStepLabel, currentStepValue]) => (
            <Box key={currentStepLabel}>
              <TextXl
                fontWeight="semibold"
                mb="5.25rem" // 84px
              >
                {currentStepLabel}
              </TextXl>

              <Text
                data-step-value
                transformOrigin="bottom"
                fontSize="8xl"
                lineHeight="6.25rem" // 100px
                fontWeight="bold"
                color="grey.700"
              >
                {currentStepValue}
              </Text>
            </Box>
          ))}
        </MotionVStack>
      </Box>

      <ArrowAnimatedBackground />
    </ModalBody>
  )
}

const AcrePointsClaimModal = withBaseModal(AcrePointsClaimModalBase, {
  returnFocusOnClose: false,
  variant: "unstyled",
  size: "xl",
})
export default AcrePointsClaimModal
