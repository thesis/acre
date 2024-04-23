import { useShowWalletErrorToast } from "./useShowWalletErrorToast"

export function useInitGlobalToasts() {
  useShowWalletErrorToast("ethereum")
  useShowWalletErrorToast("bitcoin")
}
