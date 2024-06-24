import Protocol from "../../src/modules/protocol"
import { AcreContracts, Fees } from "../../src"
import * as satoshiConverter from "../../src/lib/utils/satoshi-converter"
import { MockAcreContracts } from "../utils/mock-acre-contracts"

const data = {
  estimateDepositFees: {
    amount: 10_000_000n, // 0.1 BTC,
    // 0.1 tBTC in 1e18 precision.
    amountIn1e18: 100000000000000000n,
    mockedDepositFees: {
      tbtc: {
        // 0.00005 tBTC in 1e18 precision.
        treasuryFee: 50000000000000n,
        // 0.001 tBTC in 1e18 precision.
        depositTxMaxFee: 1000000000000000n,
        // 0.0001999 tBTC in 1e18 precision.
        optimisticMintingFee: 199900000000000n,
      },
      acre: {
        // 0.0001 tBTC in 1e18 precision.
        bitcoinDepositorFee: 100000000000000n,
      },
    },
    // 0.001 in 1e18 precision.
    stBTCDepositFee: 1000000000000000n,
    expectedDepositFeesInSatoshi: {
      tbtc: 124990n,
      acre: 110000n,
      total: 234990n,
    },
  },
}

describe("Protocol", () => {
  const contracts: AcreContracts = new MockAcreContracts()
  const protocol = new Protocol(contracts)
  const spyOnToSatoshi = jest.spyOn(satoshiConverter, "toSatoshi")

  describe("totalAssets", () => {
    const mockedResult = BigInt(123.456 * 1e18)
    // The returned result should be in satoshi precision
    const expectedResult = BigInt(123.456 * 1e8)

    let result: bigint

    beforeAll(async () => {
      spyOnToSatoshi.mockClear()
      contracts.stBTC.totalAssets = jest.fn().mockResolvedValue(mockedResult)
      result = await protocol.totalAssets()
    })

    it("should convert value to 1e8 satoshi precision", () => {
      expect(spyOnToSatoshi).toHaveBeenCalledWith(mockedResult)
      expect(spyOnToSatoshi).toHaveReturnedWith(expectedResult)
    })

    it("should return correct value", () => {
      expect(result).toBe(expectedResult)
    })
  })

  describe("minimumDepositAmount", () => {
    const mockedResult = BigInt(0.015 * 1e18)
    // The returned result should be in satoshi precision
    const expectedResult = BigInt(0.015 * 1e8)

    let result: bigint

    beforeAll(async () => {
      spyOnToSatoshi.mockClear()
      contracts.bitcoinDepositor.minDepositAmount = jest
        .fn()
        .mockResolvedValue(mockedResult)
      result = await protocol.minimumDepositAmount()
    })

    it("should convert value to 1e8 satoshi precision", () => {
      expect(spyOnToSatoshi).toHaveBeenCalledWith(mockedResult)
      expect(spyOnToSatoshi).toHaveReturnedWith(expectedResult)
    })

    it("should return correct value", () => {
      expect(result).toBe(expectedResult)
    })
  })

  describe("estimateDepositFees", () => {
    const {
      estimateDepositFees: {
        amount,
        amountIn1e18,
        mockedDepositFees,
        expectedDepositFeesInSatoshi,
        stBTCDepositFee,
      },
    } = data

    let result: Fees
    const spyOnFromSatoshi = jest.spyOn(satoshiConverter, "fromSatoshi")

    beforeAll(async () => {
      spyOnToSatoshi.mockClear()

      contracts.bitcoinDepositor.calculateDepositFee = jest
        .fn()
        .mockResolvedValue(mockedDepositFees)

      contracts.stBTC.calculateDepositFee = jest
        .fn()
        .mockResolvedValue(stBTCDepositFee)

      result = await protocol.estimateDepositFee(amount)
    })

    it("should convert provided amount from satoshi to token precision", () => {
      expect(spyOnFromSatoshi).toHaveBeenNthCalledWith(1, amount)
    })

    it("should get the deposit fees from Acre Bitcoin Depositor contract handle", () => {
      expect(
        contracts.bitcoinDepositor.calculateDepositFee,
      ).toHaveBeenCalledWith(amountIn1e18)
    })

    it("should get the stBTC deposit fee", () => {
      expect(contracts.stBTC.calculateDepositFee).toHaveBeenCalledWith(
        amountIn1e18,
      )
    })

    it("should convert tBTC network fees to satoshi", () => {
      const {
        tbtc: { depositTxMaxFee, treasuryFee, optimisticMintingFee },
      } = mockedDepositFees
      const totalTbtcFees = depositTxMaxFee + treasuryFee + optimisticMintingFee

      expect(spyOnToSatoshi).toHaveBeenNthCalledWith(1, totalTbtcFees)
    })

    it("should convert Acre network fees to satoshi", () => {
      const {
        acre: { bitcoinDepositorFee },
      } = mockedDepositFees
      const totalAcreFees = bitcoinDepositorFee

      expect(spyOnToSatoshi).toHaveBeenNthCalledWith(2, totalAcreFees)
    })

    it("should return the deposit fees in satoshi precision", () => {
      expect(result).toMatchObject(expectedDepositFeesInSatoshi)
    })
  })
})
