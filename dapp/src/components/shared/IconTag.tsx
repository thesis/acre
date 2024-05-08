import React from "react"
import { Tag, TagLeftIcon, TagLabel, TagProps, Icon } from "@chakra-ui/react"

type IconTagProps = TagProps & {
  icon: typeof Icon
}

export default function IconTag(props: IconTagProps) {
  const { children, icon, ...restProps } = props

  return (
    <Tag
      borderWidth={0}
      bg="gold.400"
      fontSize="sm"
      lineHeight={5}
      fontWeight="bold"
      pl={0}
      py={2}
      color="grey.700"
      {...restProps}
    >
      <TagLeftIcon as={icon} w={12} h={12} mr={2} my={-4} role="presentation" />
      <TagLabel>{children}</TagLabel>
    </Tag>
  )
}
