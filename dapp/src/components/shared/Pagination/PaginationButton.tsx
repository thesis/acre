import React from "react"
import { Icon, IconButton, IconButtonProps } from "@chakra-ui/react"
import { IconArrowLeft, IconArrowRight } from "@tabler/icons-react"
import { usePagination } from "./PaginationContext"

type PaginationButtonProps = Omit<IconButtonProps, "aria-label" | "icon"> & {
  mode: "previous" | "next"
}

function PaginationButton(props: PaginationButtonProps) {
  const { mode, ...restProps } = props
  const { currentPage, setPage, totalSize, pageSize } = usePagination()

  const handleClick = () =>
    setPage(mode === "next" ? currentPage + 1 : currentPage - 1)
  const isDisabled = React.useMemo(
    () =>
      mode === "next"
        ? currentPage * pageSize + pageSize >= totalSize
        : currentPage === 0,
    [mode, currentPage, pageSize, totalSize],
  )

  return (
    <IconButton
      variant="pagination"
      rounded="full"
      p={1.5}
      boxSize={7}
      minW="unset"
      icon={
        <Icon
          as={mode === "next" ? IconArrowRight : IconArrowLeft}
          strokeWidth={2}
          boxSize={4}
        />
      }
      aria-label={mode === "next" ? "Next" : "Previous"}
      onClick={handleClick}
      isDisabled={isDisabled}
      {...restProps}
    />
  )
}

export default PaginationButton
