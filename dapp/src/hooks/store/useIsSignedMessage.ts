import { selectIsSignedMessage } from "#/store/wallet"
import useAppSelector from "./useAppSelector"

export default function useIsSignedMessage() {
  return useAppSelector(selectIsSignedMessage)
}
