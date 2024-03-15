import React, { useCallback, useEffect, useState } from "react"
import { ONE_SEC_IN_MILLISECONDS } from "#/constants"
import { ERRORS, capitalize, logPromiseFailure } from "#/utils"
import { Button, Flex } from "@chakra-ui/react"
import { Toast } from "#/components/shared/alerts"
import { useToast } from "./useToast"
import { useWallet } from "./useWallet"

export function useWalletToast(
  type: "bitcoin" | "ethereum",
  delay = ONE_SEC_IN_MILLISECONDS,
) {
  //   // The toast should be visible only once.
  const [isToastAlreadyClosed, setIsToastAlreadyClosed] = useState(false)
  const {
    [type]: { account, requestAccount },
  } = useWallet()

  const handleConnect = useCallback(
    () => logPromiseFailure(requestAccount()),
    [requestAccount],
  )

  const { closeToast, showToast } = useToast({
    id: `${type}-account-toast`,
    render: ({ onClose }) => (
      <Toast
        width="xl"
        title={ERRORS.WALLET_NOT_CONNECTED(capitalize(type))}
        onClose={() => {
          onClose()
          setIsToastAlreadyClosed(true)
        }}
      >
        <Flex flexGrow={1} justifyContent="end">
          <Button
            ml={4}
            variant="outline"
            colorScheme="white"
            onClick={handleConnect}
          >
            Connect now
          </Button>
        </Flex>
      </Toast>
    ),
  })

  useEffect(() => {
    if (isToastAlreadyClosed) return

    const timeout = setTimeout(showToast, delay)

    // eslint-disable-next-line consistent-return
    return () => clearTimeout(timeout)
  }, [delay, isToastAlreadyClosed, showToast])

  useEffect(() => {
    if (!account || isToastAlreadyClosed) return

    closeToast()
    setIsToastAlreadyClosed(true)
  }, [account, closeToast, isToastAlreadyClosed, type])
}
