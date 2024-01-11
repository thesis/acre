import { AcreContracts, TBTCDepositor } from "../../src/lib/contracts"

// eslint-disable-next-line import/prefer-default-export
export class MockAcreContracts implements AcreContracts {
  public readonly depositor: TBTCDepositor

  constructor() {
    this.depositor = {
      getChainIdentifier: jest.fn(),
      getTbtcVaultChainIdentifier: jest.fn(),
      initializeStake: jest.fn(),
    } as TBTCDepositor
  }
}
