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
        xl: "0.76fr auto",
        "2.5xl":
          "minmax(358px, 0.25fr) minmax(748px, 1fr) minmax(358px, 0.25fr)",
      }}
      {...restProps}
    >
      {children}
    </Grid>
  )
}

export default PageLayout
