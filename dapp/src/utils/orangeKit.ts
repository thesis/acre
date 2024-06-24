import { Connector } from "wagmi"
import { SignInWithWalletMessage } from "@orangekit/sign-in-with-wallet"

const isConnectedStatus = (status: string) => status === "connected"

const isOrangeKitConnector = (connector?: Connector) =>
  connector?.type === "orangekit"

const createSignInWithWalletMessage = (address: string) => {
  const { host: domain, origin: uri } = window.location

  const message = new SignInWithWalletMessage({
    domain,
    address,
    uri,
    issuedAt: new Date().toISOString(),
    version: "1",
    networkFamily: "bitcoin",
  })

  return message.prepareMessage()
}

export default {
  isOrangeKitConnector,
  isConnectedStatus,
  createSignInWithWalletMessage,
}
