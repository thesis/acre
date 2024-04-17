import React, { useMemo } from "react"
import { useCountdown } from "#/hooks"
import {
  BoxProps,
  HStack,
  Grid,
  Box,
  Text,
  TextProps,
  StackProps,
} from "@chakra-ui/react"
import { AnimatePresence, motion } from "framer-motion"

const MotionBox = motion(Box)

type CountdownTimerDigitProps = Omit<BoxProps, "children"> & {
  children: number
}
function CountdownTimerDigit(props: CountdownTimerDigitProps) {
  const { children, ...restProps } = props
  return (
    <MotionBox
      px={5}
      w={14}
      py={4}
      rounded="xl"
      color="gold.200"
      bg="grey.700"
      overflow="hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1, transition: { staggerChildren: 0.1 } }}
      {...restProps}
    >
      <AnimatePresence mode="popLayout">
        <motion.div
          key={children}
          initial={{ y: -32, rotateX: -90, opacity: 1 }}
          animate={{ y: 0, rotateX: 0, opacity: 1 }}
          exit={{ y: 32, rotateX: 90, opacity: 0 }}
          transition={{ type: "spring", mass: 1.05 }}
        >
          {children}
        </motion.div>
      </AnimatePresence>
    </MotionBox>
  )
}

function CountdownTimerSegmentLabel(props: TextProps) {
  return (
    <Text
      color="white"
      fontSize="md"
      fontWeight="medium"
      lineHeight={5}
      gridColumn="1/3"
      textTransform="capitalize"
      {...props}
    />
  )
}

type CountdownTimerSegmentProps = Omit<BoxProps, "children"> & {
  label: string
  value: [number, number]
}
function CountdownTimerSegment(props: CountdownTimerSegmentProps) {
  const { label, value, ...restProps } = props
  return (
    <HStack
      spacing={2}
      alignItems="baseline"
      color="gold.200"
      fontSize="2xl"
      fontWeight="bold"
      _notLast={{
        _after: {
          content: '":"',
        },
      }}
    >
      <Grid templateColumns="repeat(2, 1fr)" gap={2} {...restProps}>
        <CountdownTimerDigit>{value[0]}</CountdownTimerDigit>
        <CountdownTimerDigit>{value[1]}</CountdownTimerDigit>
        <CountdownTimerSegmentLabel>{label}</CountdownTimerSegmentLabel>
      </Grid>
    </HStack>
  )
}

type CountdownTimerProps = Omit<StackProps, "children"> & {
  timestamp: number
}
export function CountdownTimer(props: CountdownTimerProps) {
  const { timestamp, ...restProps } = props
  const countdown = useCountdown(timestamp, true)

  const parsedCountdown = useMemo<[string, [number, number]][]>(
    () =>
      Object.entries(countdown)
        .filter(([key]) => key !== "seconds")
        .map(([key, value]) => [
          key,
          [...value].map((x) => +x) as [number, number],
        ]),
    [countdown],
  )
  return (
    <HStack spacing={2} {...restProps}>
      {parsedCountdown.map(([label, value]) => (
        <CountdownTimerSegment key={label} label={label} value={value} />
      ))}
    </HStack>
  )
}
