import { selectWalletAddress } from "#/store/wallet"
import useAppSelector from "./useAppSelector"

export default function useWalletAddress() {
  return useAppSelector(selectWalletAddress)
}
