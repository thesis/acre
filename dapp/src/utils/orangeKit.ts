import { Connector } from "wagmi"
import { SignInWithWalletMessage } from "@orangekit/sign-in-with-wallet"
import { NetworkFamily } from "#/types"

const isConnectedStatus = (status: string) => status === "connected"

const isOrangeKitConnector = (connector?: Connector) =>
  connector?.type === "orangekit"

const createSignInWithWalletMessage = (
  address: string,
  networkFamily: NetworkFamily,
) => {
  const { host: domain, origin: uri } = window.location

  const message = new SignInWithWalletMessage({
    domain,
    address,
    uri,
    issuedAt: new Date().toISOString(),
    version: "1",
    chainId: networkFamily === "evm" ? 1 : undefined,
    networkFamily,
  })

  return message.prepareMessage()
}

export default {
  isOrangeKitConnector,
  isConnectedStatus,
  createSignInWithWalletMessage,
}
