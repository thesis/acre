import {
  BitcoinClient,
  DepositsService,
  MaintenanceService,
  RedemptionsService,
  TBTC,
  TBTCContracts,
} from "@keep-network/tbtc-v2.ts"

// eslint-disable-next-line import/prefer-default-export
export class MockTBTC implements TBTC {
  deposits: DepositsService

  maintenance: MaintenanceService

  redemptions: RedemptionsService

  tbtcContracts: TBTCContracts

  bitcoinClient: BitcoinClient

  constructor() {
    this.deposits = jest.fn() as unknown as DepositsService
    this.maintenance = jest.fn() as unknown as MaintenanceService
    this.redemptions = jest.fn() as unknown as RedemptionsService
    this.tbtcContracts = jest.fn() as unknown as TBTCContracts
    this.bitcoinClient = jest.fn() as unknown as BitcoinClient
  }
}
