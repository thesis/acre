import { BitcoinProvider } from "../../src/lib/bitcoin/providers"

class MockBitcoinProvider implements BitcoinProvider {
  getAddress = jest.fn()

  getPublicKey = jest.fn()

  signMessage = jest.fn()
}

// eslint-disable-next-line import/prefer-default-export
export { MockBitcoinProvider }
