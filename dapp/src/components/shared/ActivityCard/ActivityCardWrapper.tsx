import React from "react"
import { CardProps, Card } from "@chakra-ui/react"

type ActivityCardWrapperProps = CardProps & {
  isCompleted: boolean
  children: React.ReactNode
  isActive?: boolean
}

const completedStyles = {
  bg: "green.200",
  borderColor: "green.100",
  _hover: {
    boxShadow: "lg",
    bg: "green.200",
    borderColor: "green.100",
  },
}

const activeStyles = {
  boxShadow: "lg",
  bg: "gold.100",
  borderColor: "white",
  _before: {
    content: '""',
    bg: "gold.700",
    position: "absolute",
    left: -1.5,
    top: 0,
    bottom: 0,
    right: 0,
    borderRadius: 12,
    zIndex: -1,
  },
}

export function ActivityCardWrapper({
  isActive,
  isCompleted,
  children,
  ...props
}: ActivityCardWrapperProps) {
  return (
    <Card
      w={64}
      mr={3}
      px={5}
      p={3}
      cursor="pointer"
      borderWidth={1}
      borderColor="gold.100"
      _hover={{
        boxShadow: "lg",
        bg: "gold.100",
        borderColor: "white",
      }}
      {...(isActive && activeStyles)}
      {...(isCompleted && completedStyles)}
      {...props}
    >
      {children}
    </Card>
  )
}
