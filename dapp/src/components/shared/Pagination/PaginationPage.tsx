import { Box, BoxProps } from "@chakra-ui/react"
import { AnimatePresence, Transition, Variants, motion } from "framer-motion"
import React from "react"
import { usePagination } from "./PaginationContext"

const pageTransition: Transition = {
  type: "spring",
  duration: 0.75,
}

const pageVariants: Variants = {
  enter: (direction: "left" | "right") => ({
    x: direction === "right" ? "150%" : "-150%",
    transition: pageTransition,
  }),
  center: {
    x: 0,
    transition: pageTransition,
  },
  exit: (direction: "left" | "right") => ({
    x: direction === "left" ? "150%" : "-150%",
    transition: pageTransition,
  }),
}

type PaginationPageProps = Omit<BoxProps, "children"> & {
  children: (pageData: unknown[]) => React.ReactNode
}

export function PaginationPage(props: PaginationPageProps) {
  const { children, ...restProps } = props
  const { currentPage, direction, pageData } = usePagination()

  return (
    <AnimatePresence mode="popLayout" initial={false} custom={direction}>
      <Box
        as={motion.div}
        custom={direction}
        key={currentPage}
        variants={pageVariants}
        animate="center"
        initial="enter"
        exit="exit"
        {...restProps}
      >
        {children(pageData)}
      </Box>
    </AnimatePresence>
  )
}
