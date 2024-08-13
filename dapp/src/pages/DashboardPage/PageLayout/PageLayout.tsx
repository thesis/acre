import React from "react"
import { Grid, GridProps } from "@chakra-ui/react"

function PageLayout(props: GridProps) {
  const { children, ...restProps } = props

  return (
    <Grid
      w="full"
      maxW="110rem" // 1760px -> content width + x-axis padding
      mx="auto"
      px={10}
      py={9}
      gap={8}
      alignItems="start"
      gridTemplateRows="auto 1fr"
      gridTemplateColumns={{
        base: "1fr",
        md: "repeat(2, 1fr)",
        lg: "1fr 0.6fr",
        "2xl": "minmax(396px, auto) 1fr minmax(480px, auto)",
      }}
      {...restProps}
    >
      {children}
    </Grid>
  )
}

export default PageLayout
