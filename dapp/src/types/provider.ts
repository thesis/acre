import { AcreBitcoinProvider } from "@acre-btc/sdk"
import { OrangeKitBitcoinWalletProvider } from "@orangekit/react/src/wallet/bitcoin-wallet-provider"
import { SignInWithWalletMessage } from "@orangekit/sign-in-with-wallet"

export interface AcreDappBitcoinProvider
  extends OrangeKitBitcoinWalletProvider,
    AcreBitcoinProvider {
  signSignInMessage?(
    message: string,
    data: SignInWithWalletMessage,
  ): Promise<string>
}
