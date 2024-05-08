import { StackProps, Stack, Box } from "@chakra-ui/react"
import { AnimatePresence, Transition, Variants, motion } from "framer-motion"
import React from "react"
import { useSize } from "@chakra-ui/react-use-size"
import { usePagination } from "./PaginationContext"

const transition: Transition = {
  type: "spring",
  duration: 0.75,
}

const variants: Variants = {
  enter: (direction: "left" | "right") => ({
    x: direction === "right" ? "120%" : "-120%",
    transition,
  }),
  center: {
    x: 0,
    transition,
  },
  exit: (direction: "left" | "right") => ({
    x: direction === "left" ? "120%" : "-120%",
    transition,
  }),
}

type PaginationPageProps = Omit<StackProps, "children"> & {
  children: (pageData: unknown[]) => React.ReactNode
}

function PaginationPage(props: PaginationPageProps) {
  const { children, ...restProps } = props
  const { currentPage, direction, pageData } = usePagination()

  const ref = React.useRef<HTMLDivElement>(null)
  const { height } = useSize(ref) ?? { height: 0 }

  return (
    <Box as={motion.div} layout animate={{ height, transition }}>
      <Box ref={ref}>
        <AnimatePresence mode="popLayout" initial={false}>
          <Stack
            as={motion.div}
            custom={direction}
            key={currentPage}
            variants={variants}
            animate="center"
            initial="enter"
            exit="exit"
            {...restProps}
          >
            {children(pageData)}
          </Stack>
        </AnimatePresence>
      </Box>
    </Box>
  )
}

export default PaginationPage
