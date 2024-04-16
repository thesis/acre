import { AcreContracts, BitcoinDepositor, StBTC } from "../../src/lib/contracts"

// eslint-disable-next-line import/prefer-default-export
export class MockAcreContracts implements AcreContracts {
  public readonly bitcoinDepositor: BitcoinDepositor

  public readonly stBTC: StBTC

  constructor() {
    this.bitcoinDepositor = {
      getChainIdentifier: jest.fn(),
      getTbtcVaultChainIdentifier: jest.fn(),
      decodeExtraData: jest.fn(),
      encodeExtraData: jest.fn(),
      revealDeposit: jest.fn(),
      minDepositAmount: jest.fn(),
    } as BitcoinDepositor

    this.stBTC = {
      balanceOf: jest.fn(),
      assetsBalanceOf: jest.fn(),
    } as StBTC
  }
}
