import React, { ReactElement } from "react"
import {
  Button,
  ModalBody,
  ModalHeader,
  Box,
  Stepper,
  Step,
  StepIndicator,
  ModalFooter,
  useSteps,
  SimpleGrid,
  StepIndicatorProps,
  UseStepsReturn,
  Highlight,
} from "@chakra-ui/react"
import { H3, TextSm } from "#/components/shared/Typography"
import { BaseModalProps, DappMode } from "#/types"
import { EmbedApp } from "#/utils/referralProgram"
import { useIsEmbed, useMobileMode } from "#/hooks"
import withBaseModal from "./ModalRoot/withBaseModal"
import step1Video from "../assets/videos/welcome-steps/welcome-step-1.mp4"
import step2Video from "../assets/videos/welcome-steps/welcome-step-2.mp4"
import step3Video from "../assets/videos/welcome-steps/welcome-step-3.mp4"

const dappModeToContent: Record<DappMode, () => ReactElement> = {
  standalone: () => (
    <>
      Acre makes earning rewards with your BTC simple and secure. Dedicated to
      everyone, it&apos;s fun and easy to use. No advanced knowledge required.
    </>
  ),
  "ledger-live": () => (
    <Highlight query="Ledger Live">
      Acre makes earning rewards with your BTC simple and secure. Tailored for
      Ledger Live, it&apos;s fun and easy to use. No advanced knowledge
      required.
    </Highlight>
  ),
}

const steps = [
  {
    id: 0,
    title: (
      <H3 fontWeight="semibold">
        Activate your BTC,{" "}
        <Box as="span" display="block" color="orange.30">
          earn rewards
        </Box>
      </H3>
    ),
    content: (embeddedApp?: EmbedApp) =>
      dappModeToContent[embeddedApp ?? "standalone"](),

    video: step1Video,
  },
  {
    id: 1,
    title: (
      <H3 fontWeight="semibold">
        <Box as="span" display="block" color="orange.30">
          Battle-tested{" "}
        </Box>
        in the market
      </H3>
    ),
    content: () => (
      <Highlight query="tBTC">
        Acre is powered by tBTC, the trusted Bitcoin bridge that secured over
        half a billion dollars in BTC. No centralized custodians, everything is
        fully on-chain.
      </Highlight>
    ),
    video: step2Video,
  },
  {
    id: 2,
    title: (
      <H3 fontWeight="semibold">
        One dashboard,{" "}
        <Box as="span" display="block" color="orange.30">
          endless rewards
        </Box>
      </H3>
    ),
    content: () => (
      <Highlight query="Acre Points Program">
        As a depositor, you&apos;re automatically in the Acre Points Program.
        Enjoy daily points drops and exclusive partner rewards. Start stacking
        those points!
      </Highlight>
    ),
    video: step3Video,
  },
]

const stepIndicatorStyleProps: StepIndicatorProps = {
  sx: {
    "[data-status=active] &": {
      opacity: 1,
    },
    "&[data-status=complete], [data-status=incomplete] &": {
      bgColor: "orange.50",
    },
  },
  border: "none",
  w: "2.5",
  h: "2.5",
  rounded: "50%",
  bgColor: "orange.50",
  opacity: "0.15",
  _hover: {
    cursor: "pointer",
  },
}

function WelcomeModalBase({ closeModal }: BaseModalProps) {
  // Cast to fix eslint error: `unbound-method`.
  const { activeStep, goToNext, setActiveStep } = useSteps({
    index: 0,
    count: steps.length,
  }) as UseStepsReturn & { goToNext: () => void }
  const { embeddedApp } = useIsEmbed()
  const isMobileMode = useMobileMode()

  const isLastStep = activeStep + 1 === steps.length
  const activeStepData = steps[activeStep]

  return (
    <SimpleGrid columns={2} templateColumns="1fr auto">
      <Box>
        <ModalHeader gap={3} pb={8}>
          <TextSm mb="12" color="neutral.70">
            Welcome to Acre,
          </TextSm>
          {activeStepData.title}
        </ModalHeader>
        <ModalBody textAlign="left" display="block" color="brown.80" px="10">
          {activeStepData.content(embeddedApp)}
        </ModalBody>
        <ModalFooter
          display="flex"
          flexDirection="row"
          justifyContent="space-between"
          mt="14"
        >
          <Stepper index={activeStep} gap="3">
            {steps.map((step) => (
              <Step key={step.id} onClick={() => setActiveStep(step.id)}>
                <StepIndicator {...stepIndicatorStyleProps} />
              </Step>
            ))}
          </Stepper>
          <Button
            variant={isLastStep ? undefined : "outline"}
            onClick={isLastStep ? closeModal : goToNext}
          >
            {isLastStep ? "Get started" : "Next"}
          </Button>
        </ModalFooter>
      </Box>
      {!isMobileMode && (
        <Box
          as="video"
          src={activeStepData.video}
          width="24rem"
          height="full"
          autoPlay
          muted
          loop
          objectFit="cover"
          roundedRight="xl"
          outline="1px solid #f6ead5"
          outlineOffset="-1px"
        />
      )}
    </SimpleGrid>
  )
}

const WelcomeModal = withBaseModal(WelcomeModalBase, {
  size: "xl",
})
export default WelcomeModal
