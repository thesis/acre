/* eslint-disable @typescript-eslint/no-unsafe-call */
import {
  BitcoinClient,
  BitcoinNetwork,
  DepositsService,
  MaintenanceService,
  RedemptionsService,
  TBTC,
  TBTCContracts,
} from "@keep-network/tbtc-v2.ts"

// @ts-expect-error we only mock the methods used in our SDK.
// eslint-disable-next-line import/prefer-default-export
export class MockTbtcSdk implements TBTC {
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
    this.bitcoinClient = {
      getNetwork: jest.fn().mockResolvedValue(BitcoinNetwork.Testnet),
    } as unknown as BitcoinClient
  }
}
