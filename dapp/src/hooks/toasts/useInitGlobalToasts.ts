import { useShowWalletErrorToast } from "./useShowWalletErrorToast"

export function useInitGlobalToasts() {
  useShowWalletErrorToast("bitcoin")
}
