import { Connector } from "wagmi"
import { SignInWithWalletMessage } from "@orangekit/sign-in-with-wallet"
import { OrangeKitConnector } from "#/types"

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

const typeConversionToOrangeKitConnector = (
  connector?: Connector,
): OrangeKitConnector => connector as unknown as OrangeKitConnector

const typeConversionToConnector = (connector?: OrangeKitConnector): Connector =>
  connector as unknown as Connector

export default {
  isOrangeKitConnector,
  isConnectedStatus,
  createSignInWithWalletMessage,
  typeConversionToOrangeKitConnector,
  typeConversionToConnector,
}
