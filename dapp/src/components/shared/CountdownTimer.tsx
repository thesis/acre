import React from "react"
import { useCountdown } from "#/hooks"
import { Tuple } from "#/types"
import {
  Box,
  BoxProps,
  Grid,
  HStack,
  StackProps,
  Text,
  TextProps,
} from "@chakra-ui/react"
import { AnimatePresence, motion } from "framer-motion"

type SizeType = "sm" | "md"

const sizeStyles = {
  digit: {
    sm: {
      px: 1,
      w: 6,
      py: 1,
      rounded: "base",
    },
    md: {
      px: 5,
      w: 14,
      py: 4,
      rounded: "xl",
    },
  },

  segment: {
    sm: {
      fontSize: "sm",
      lineHeight: 5,
    },
    md: {
      fontSize: "2xl",
      lineHeight: 8,
    },
  },

  segmentWrapper: {
    sm: {
      gap: "px",
    },
    md: {
      gap: 2,
    },
  },

  segmentSeparator: {
    md: {
      content: '":"',
    },
  },
}

type CountdownTimerDigitProps = Omit<BoxProps, "children"> & {
  children: number
  size: SizeType
}
function CountdownTimerDigit(props: CountdownTimerDigitProps) {
  const { children, size, ...restProps } = props
  return (
    <Box
      as={motion.div}
      sx={sizeStyles.digit[size]}
      color="gold.200"
      bg="grey.700"
      overflow="hidden"
      textAlign="center"
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
    </Box>
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
  value: Tuple<number>
  size: SizeType
}
function CountdownTimerSegment(props: CountdownTimerSegmentProps) {
  const { label, value, size, ...restProps } = props
  return (
    <HStack
      sx={sizeStyles.segment[size]}
      spacing={2}
      alignItems="baseline"
      color="gold.200"
      fontWeight="bold"
      _notLast={{
        _after: {
          content: size === "md" ? '":"' : undefined,
        },
      }}
    >
      <Grid
        templateColumns="repeat(2, 1fr)"
        sx={sizeStyles.segmentWrapper[size]}
        {...restProps}
      >
        <CountdownTimerDigit size={size}>{value[0]}</CountdownTimerDigit>
        <CountdownTimerDigit size={size}>{value[1]}</CountdownTimerDigit>
        {size === "md" && (
          <CountdownTimerSegmentLabel>{label}</CountdownTimerSegmentLabel>
        )}
      </Grid>
    </HStack>
  )
}

type CountdownTimerProps = Omit<StackProps, "children"> & {
  timestamp: number
  size?: SizeType
}
export function CountdownTimer(props: CountdownTimerProps) {
  const { timestamp, size = "md", ...restProps } = props
  const countdown = useCountdown(timestamp)

  const parsedCountdown = React.useMemo(
    () =>
      Object.entries(countdown).reduce<[string, Tuple<number>][]>(
        (accumulator, currentValue) => {
          const [key, stringValue] = currentValue

          if (key === "seconds") return accumulator

          const value = +stringValue
          const parsedValue = (
            value > 0
              ? Array.from(value.toString().padStart(2, "0")).map(Number)
              : Array(2).fill(0)
          ) as Tuple<number>

          return [...accumulator, [key, parsedValue]]
        },
        [],
      ),
    [countdown],
  )
  return (
    <HStack spacing={2} userSelect="none" {...restProps}>
      {parsedCountdown.map(([label, value]) => (
        <CountdownTimerSegment
          key={label}
          label={label}
          value={value}
          size={size}
        />
      ))}
    </HStack>
  )
}
