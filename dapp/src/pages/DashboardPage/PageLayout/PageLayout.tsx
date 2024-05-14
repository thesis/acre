import React from "react"
import { Grid, GridProps } from "@chakra-ui/react"

function PageLayout(props: GridProps) {
  const { children, ...restProps } = props

  return (
    <Grid
      px={10}
      py={9}
      gap={8}
      alignItems="start"
      gridTemplateColumns={{
        base: "1fr",
        md: "repeat(2, 1fr)",
        lg: "1fr 0.5fr",
        xl: "minmax(358px, auto) 1fr minmax(358px, auto)",
      }}
      {...restProps}
    >
      {children}
    </Grid>
  )
}

export default PageLayout
