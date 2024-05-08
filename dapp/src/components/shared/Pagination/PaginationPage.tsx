import React from "react"
import { BoxProps, Box } from "@chakra-ui/react"
import { Variants, AnimatePresence, motion, Transition } from "framer-motion"
import { usePagination } from "./PaginationContext"

const pageTransition: Transition = {
  type: "spring",
  duration: 0.75,
}

const pageVariants: Variants = {
  enter: (direction: "left" | "right") => ({
    x: direction === "right" ? "100%" : "-100%",
    transition: pageTransition,
  }),
  center: {
    x: 0,
    transition: pageTransition,
  },
  exit: (direction: "left" | "right") => ({
    x: direction === "left" ? "100%" : "-100%",
    transition: pageTransition,
  }),
}

function PaginationPage(props: BoxProps) {
  const { currentPage, direction } = usePagination()

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
        {...props}
      />
    </AnimatePresence>
  )
}

export default PaginationPage
