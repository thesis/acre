import { AcreBitcoinProvider } from "../../src/lib/bitcoin/providers"

class MockBitcoinProvider implements AcreBitcoinProvider {
  getAddress = jest.fn()

  getPublicKey = jest.fn()

  signMessage = jest.fn()
}

// eslint-disable-next-line import/prefer-default-export
export { MockBitcoinProvider }
