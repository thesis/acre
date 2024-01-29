import { AcreContracts, TBTCDepositor } from "../../src/lib/contracts"

// eslint-disable-next-line import/prefer-default-export
export class MockAcreContracts implements AcreContracts {
  public readonly tbtcDepositor: TBTCDepositor

  constructor() {
    this.tbtcDepositor = {
      getChainIdentifier: jest.fn(),
      getTbtcVaultChainIdentifier: jest.fn(),
      decodeExtraData: jest.fn(),
      encodeExtraData: jest.fn(),
      revealDeposit: jest.fn(),
    } as TBTCDepositor
  }
}
