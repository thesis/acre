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
  const [isToastClosed, setIsToastClosed] = useState(false)
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
        status="error"
        width="xl"
        title={ERRORS.WALLET_NOT_CONNECTED(capitalize(type))}
        onClose={() => {
          onClose()
          setIsToastClosed(true)
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
    if (isToastClosed) return

    const timeout = setTimeout(showToast, delay)

    // eslint-disable-next-line consistent-return
    return () => clearTimeout(timeout)
  }, [delay, isToastClosed, showToast])

  useEffect(() => {
    if (!account || isToastClosed) return

    closeToast()
    setIsToastClosed(true)
  }, [account, closeToast, isToastClosed, type])
}
