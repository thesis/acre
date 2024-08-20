import React, { useEffect, useMemo } from "react"
import { useAcrePoints } from "#/hooks"
import { Box, ModalBody, Text, VStack } from "@chakra-ui/react"
import {
  AnimationSequence,
  motion,
  Transition,
  useAnimate,
  useMotionValue,
} from "framer-motion"
import { getNumberWithSign } from "#/utils"
import withBaseModal from "../ModalRoot/withBaseModal"
import { TextXl } from "../shared/Typography"

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
  delay: 4, // step duration
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
  const { formatted, data } = useAcrePoints()
  const rankDifference = getNumberWithSign(
    data.estimatedRankPosition - data.rankPosition,
  )

  const steps = useMemo(
    () => [
      ["You earned", `+${formatted.claimablePointsAmount} PTS`],
      [
        "Updating points balance..." /* Staggered text component: current points + claimed */,
        "2,749,993",
      ],
      ["Calculating rank...", rankDifference],
      [
        "Updating rank..." /* Staggered text component: current rank + difference */,
        "#4923",
      ],
    ],
    [formatted, rankDifference],
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
            <Box key={currentStepValue}>
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
                color="brand.400"
              >
                {currentStepValue}
              </Text>
            </Box>
          ))}
        </MotionVStack>
      </Box>
    </ModalBody>
  )
}

const AcrePointsClaimModal = withBaseModal(AcrePointsClaimModalBase, {
  returnFocusOnClose: false,
  variant: "unstyled",
  size: "xl",
})
export default AcrePointsClaimModal
