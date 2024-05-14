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
              xl: "1 / 1 / 3 / 2",
              "2.5xl": "1 / 2 / -1 / 3",
              base: "1 / 1 / -1 / -1",
            }
          : undefined
      }
      align="stretch"
      {...restProps}
    />
  )
}

export default PageLayoutColumn
