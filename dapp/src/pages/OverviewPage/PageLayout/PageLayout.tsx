import React from "react"
import { Grid, GridProps, Box } from "@chakra-ui/react"
import PageLayoutSidebar from "./PageLayoutSidebar"

type PageLayoutProps = Omit<GridProps, "children"> & {
  children: React.ReactNode
  leftSidebar?: React.ReactNode
  rightSidebar?: React.ReactNode
}

function PageLayout(props: PageLayoutProps) {
  const { children, leftSidebar, rightSidebar, ...restProps } = props
  const isSidebarPropsInvalid = [leftSidebar, rightSidebar]
    .filter(Boolean)
    .some(
      (value) =>
        !React.isValidElement(value) || value.type !== PageLayoutSidebar,
    )

  if (isSidebarPropsInvalid) {
    throw new Error("Sidebar content must be wrapped with `PageLayoutSidebar`.")
  }

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
      <Box
        gridArea={{
          xl: "1 / 1 / 3 / 2",
          "2.5xl": "1 / 2 / -1 / 3",
          base: "1 / 1 / -1 / -1",
        }}
      >
        {children}
      </Box>
      {leftSidebar}
      {rightSidebar}
    </Grid>
  )
}

export default PageLayout
