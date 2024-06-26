import { selectIsSignedMessage } from "#/store/wallet"
import { useAppSelector } from "./useAppSelector"

export function useIsSignedMessage() {
  return useAppSelector(selectIsSignedMessage)
}
