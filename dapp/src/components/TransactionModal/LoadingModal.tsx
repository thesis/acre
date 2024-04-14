import React from "react"
import { ModalBody, ModalHeader, VStack } from "@chakra-ui/react"
import Spinner from "#/components/shared/Spinner"
import Skeleton from "#/components/shared/Skeleton"

export default function LoadingModal() {
  return (
    <>
      <ModalHeader>Loading...</ModalHeader>
      <ModalBody minH={96}>
        <Spinner size="xl" />
        <VStack>
          <Skeleton height={12} w={60} />
          <Skeleton height={6} w={40} />
          <Skeleton />
        </VStack>
      </ModalBody>
    </>
  )
}
