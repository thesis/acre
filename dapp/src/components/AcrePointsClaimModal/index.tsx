import React, { ReactNode, useEffect, useMemo, useState } from "react"
import { useAcrePoints, useModal, useTimeout } from "#/hooks"
import { Box, Button, ModalBody, Text, VStack } from "@chakra-ui/react"
import {
  AnimationSequence,
  motion,
  Transition,
  useAnimate,
} from "framer-motion"
import { logPromiseFailure, numberToLocaleString } from "#/utils"
import { ONE_SEC_IN_MILLISECONDS } from "#/constants"
import ConfettiExplosion from "react-confetti-explosion"
import withBaseModal from "../ModalRoot/withBaseModal"
import { TextXl } from "../shared/Typography"
import { AnimatedNumber } from "../shared/AnimatedNumber"

const MotionBox = motion(Box)

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
const AUTOCLOSE_DELAY = 12 * ONE_SEC_IN_MILLISECONDS
const CONFETTI_DURATION = 4 * ONE_SEC_IN_MILLISECONDS

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
  const {
    claimableBalance: claimedPointsAmount,
    totalBalance,
    updateUserPointsData,
  } = useAcrePoints()

  const formattedClaimablePointsAmount = numberToLocaleString(
    claimedPointsAmount,
    0,
  )
  const formattedTotalPointsAmount = numberToLocaleString(
    totalBalance + claimedPointsAmount,
    0,
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
          value={formattedTotalPointsAmount}
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
    [formattedClaimablePointsAmount, formattedTotalPointsAmount],
  )

  const [scope, animate] = useAnimate()

  useEffect(() => {
    const offsets = getStepOffsets(steps.length, STEP_HEIGHT, STEP_SPACING)
    const valueElements = [
      ...(scope.current as HTMLElement).querySelectorAll("[data-step-value]"),
    ].slice(0, -1)

    const sequence = [
      ["[data-steps-list]", { y: offsets[0] }, TRANSITION],
      [
        "[data-container]",
        {
          clipPath: `polygon(0 0, 100% 0, 100% ${CONTAINER_HEIGHT}px, 0 ${CONTAINER_HEIGHT}px)`,
        },
        { at: "<", ...TRANSITION },
      ],

      [valueElements[0], { scale: VALUE_SCALE }, { at: "<", ...TRANSITION }],
      ["[data-close-button]", { opacity: 1 }, { at: "<", ...TRANSITION }],

      // ["[data-steps-list]", { y: offsets[1] }, TRANSITION],
      // [valueElements[1], { scale: VALUE_SCALE }, { at: "<", ...TRANSITION }],

      // ["[data-steps-list]", { y: offsets[2] }, TRANSITION],
      // [valueElements[2], { scale: VALUE_SCALE }, { at: "<", ...TRANSITION }],
    ] as AnimationSequence

    const handleAnimation = async () => {
      await animate(sequence)
    }

    // eslint-disable-next-line no-void
    void handleAnimation()
  }, [scope, animate, steps])

  const { closeModal } = useModal()

  const [isCofettiExploded, setIsCofettiExploded] = useState(false)

  const handleClose = () => {
    logPromiseFailure(updateUserPointsData())
    closeModal()
  }

  useTimeout(handleClose, AUTOCLOSE_DELAY)

  return (
    <ModalBody gap={0} p={0} pos="relative" ref={scope}>
      <MotionBox
        data-container
        clipPath={`polygon(0 0, 100% 0, 100% ${INITIAL_CONTAINER_HEIGHT}px, 0 ${INITIAL_CONTAINER_HEIGHT}px)`}
        overflow="hidden"
      >
        <VStack data-steps-list spacing={8}>
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
        </VStack>
      </MotionBox>

      <Button
        opacity={0}
        onClick={handleClose}
        data-close-button
        variant="outline"
      >
        Yay!
      </Button>

      {!isCofettiExploded && (
        <Box
          pos="absolute"
          top={0}
          left="50%"
          translateX="-50%"
          transform="auto"
        >
          <ConfettiExplosion
            zIndex={1410} // Chakra's modal has a z-index of 1400
            width={768}
            height="100vh"
            duration={CONFETTI_DURATION}
            force={0.2}
            onComplete={() => setIsCofettiExploded(true)}
          />
        </Box>
      )}
    </ModalBody>
  )
}

const AcrePointsClaimModal = withBaseModal(AcrePointsClaimModalBase, {
  returnFocusOnClose: false,
  variant: "unstyled",
  size: "full",
})
export default AcrePointsClaimModal
