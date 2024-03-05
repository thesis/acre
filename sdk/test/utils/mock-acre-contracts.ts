import { AcreContracts, StBTC, TBTCDepositor } from "../../src/lib/contracts"

// eslint-disable-next-line import/prefer-default-export
export class MockAcreContracts implements AcreContracts {
  public readonly tbtcDepositor: TBTCDepositor

  public readonly stBTC: StBTC

  constructor() {
    this.tbtcDepositor = {
      getChainIdentifier: jest.fn(),
      getTbtcVaultChainIdentifier: jest.fn(),
      decodeExtraData: jest.fn(),
      encodeExtraData: jest.fn(),
      revealDeposit: jest.fn(),
    } as TBTCDepositor

    this.stBTC = {
      balanceOf: jest.fn(),
      assetsBalanceOf: jest.fn(),
    } as StBTC
  }
}
