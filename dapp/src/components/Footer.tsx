import React from "react"
import {
  Box,
  useMultiStyleConfig,
  List,
  ListItem,
  LinkProps,
  Link,
  Button,
  Icon,
} from "@chakra-ui/react"
import { EXTERNAL_HREF } from "#/constants"
import { AcreSignIcon, ArrowUpRight } from "#/assets/icons"

const NAVIGATION: Pick<LinkProps, "href" | "isExternal" | "children">[] = [
  {
    children: "Acre.fi",
    href: EXTERNAL_HREF.WEBSITE,
    isExternal: true,
  },
  {
    children: "Docs",
    href: EXTERNAL_HREF.DOCS,
    isExternal: true,
  },
  {
    children: "FAQ",
    href: EXTERNAL_HREF.FAQ,
    isExternal: true,
  },
  {
    children: "Blog",
    href: EXTERNAL_HREF.BLOG,
    isExternal: true,
  },
  {
    children: "Discord",
    href: EXTERNAL_HREF.DISCORD,
    isExternal: true,
  },
  {
    children: "X",
    href: EXTERNAL_HREF.X,
    isExternal: true,
  },
]

const DOCUMENTS: Pick<LinkProps, "href" | "isExternal" | "children">[] = [
  {
    children: "Privacy Policy",
    href: EXTERNAL_HREF.PRIVACY_POLICY,
    isExternal: true,
  },
  {
    children: "Terms of Use",
    href: EXTERNAL_HREF.TERMS_OF_USE,
    isExternal: true,
  },
]

export default function Footer() {
  const styles = useMultiStyleConfig("Footer")

  return (
    <Box as="footer" __css={styles.container}>
      <Box __css={styles.wrapper}>
        <AcreSignIcon __css={styles.logo} />

        {[NAVIGATION, DOCUMENTS].map((items) => (
          <List __css={styles.list}>
            {items.map((link) => (
              <ListItem key={link.href}>
                <Button
                  as={Link}
                  __css={styles.link}
                  iconSpacing={0}
                  rightIcon={<Icon as={ArrowUpRight} />}
                  {...link}
                />
              </ListItem>
            ))}
          </List>
        ))}
      </Box>
    </Box>
  )
}
