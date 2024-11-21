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
import { useMobileMode } from "#/hooks"

type FooterListItem = Pick<LinkProps, "href" | "children">

const NAVIGATION: FooterListItem[] = [
  {
    children: "Acre.fi",
    href: EXTERNAL_HREF.WEBSITE,
  },
  {
    children: "Docs",
    href: EXTERNAL_HREF.DOCS,
  },
  {
    children: "FAQ",
    href: EXTERNAL_HREF.FAQ,
  },
  {
    children: "Blog",
    href: EXTERNAL_HREF.BLOG,
  },
  {
    children: "Discord",
    href: EXTERNAL_HREF.DISCORD,
  },
  {
    children: "X",
    href: EXTERNAL_HREF.X,
  },
]

const DOCUMENTS: FooterListItem[] = [
  {
    children: "Privacy Policy",
    href: EXTERNAL_HREF.PRIVACY_POLICY,
  },
  {
    children: "Terms of Use",
    href: EXTERNAL_HREF.TERMS_OF_USE,
  },
]

const getItemsList = (
  items: FooterListItem[],
  styles: ReturnType<typeof useMultiStyleConfig>,
) => (
  <List __css={styles.list}>
    {items.map((link) => (
      <ListItem key={link.href}>
        <Button
          as={Link}
          __css={styles.link}
          iconSpacing={0}
          rightIcon={<Icon as={ArrowUpRight} />}
          {...link}
          isExternal
        />
      </ListItem>
    ))}
  </List>
)

export default function Footer() {
  const styles = useMultiStyleConfig("Footer")
  const isMobileMode = useMobileMode()

  if (isMobileMode) return null

  return (
    <Box as="footer" __css={styles.container}>
      <Box __css={styles.wrapper}>
        <AcreSignIcon __css={styles.logo} />

        {getItemsList(NAVIGATION, styles)}
        {getItemsList(DOCUMENTS, styles)}
      </Box>
    </Box>
  )
}
