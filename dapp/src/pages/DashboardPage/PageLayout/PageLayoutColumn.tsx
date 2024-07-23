import React from "react"
import { StackProps, VStack } from "@chakra-ui/react"

type PageLayoutColumnProps = StackProps & {
  isMain?: boolean
}

function PageLayoutColumn(props: PageLayoutColumnProps) {
  const { isMain = false, ...restProps } = props

  return (
    <VStack
      spacing={4}
      gridArea={
        isMain
          ? {
              base: "1 / 1 / -1 / -1",
              lg: "1 / 1 / 3 / 2",
              "2xl": "1 / 2 / -1 / 3",
            }
          : undefined
      }
      align="stretch"
      {...restProps}
    />
  )
}

export default PageLayoutColumn
