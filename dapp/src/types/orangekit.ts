import { CreateOrangeKitConnectorFn } from "@orangekit/react/dist/src/wallet/connector"

export type OrangeKitConnector = ReturnType<CreateOrangeKitConnectorFn>

export type OrangeKitError = Error & {
  cause?: {
    code: number
  }
}
