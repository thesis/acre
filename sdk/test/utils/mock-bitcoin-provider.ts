// eslint-disable-next-line max-classes-per-file
import { AcreBitcoinProvider } from "../../src/lib/bitcoin/providers"

class MockBitcoinProvider implements AcreBitcoinProvider {
  getAddress = jest.fn()

  getPublicKey = jest.fn()

  signMessage = jest.fn()
}

class MockBitcoinProviderWithSignWithdrawMessage extends MockBitcoinProvider {
  signWithdrawMessage = jest.fn()
}

export { MockBitcoinProvider, MockBitcoinProviderWithSignWithdrawMessage }
