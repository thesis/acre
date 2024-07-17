import React from "react"
import { SkeletonProps } from "@chakra-ui/react"
import { useIsSignedMessage } from "#/hooks"
import Skeleton from "./Skeleton"

export default function UserDataSkeleton({ ...props }: SkeletonProps) {
  const isSignedMessage = useIsSignedMessage()

  return <Skeleton isLoaded={isSignedMessage} {...props} />
}
