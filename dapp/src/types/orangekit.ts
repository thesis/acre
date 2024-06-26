import { CreateOrangeKitConnectorFn } from "@orangekit/react/dist/src/wallet/connector"

export type OrangeKitError = Error & {
  cause?: { code: number }
}

export type OrangeKitConnector = ReturnType<CreateOrangeKitConnectorFn>
