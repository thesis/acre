import React from "react"
import { Icon, IconButton, IconButtonProps } from "@chakra-ui/react"
import { IconArrowLeft, IconArrowRight } from "@tabler/icons-react"

type PaginationButtonProps = Omit<IconButtonProps, "aria-label" | "icon"> & {
  mode: "previous" | "next"
}

function PaginationButton(props: PaginationButtonProps) {
  const { mode, ...restProps } = props
  return (
    <IconButton
      icon={<Icon as={mode === "next" ? IconArrowRight : IconArrowLeft} />}
      aria-label={mode === "next" ? "Next" : "Previous"}
      {...restProps}
    />
  )
}

export default PaginationButton
