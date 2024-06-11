import ethers, { Contract } from "ethers"
import { EthereumStBTC } from "../../../src/lib/ethereum/stbtc"
import { EthereumAddress, EthereumSigner } from "../../../src/lib/ethereum"

jest.mock("ethers", (): object => ({
  Contract: jest.fn(),
  ...jest.requireActual("ethers"),
}))

describe("stbtc", () => {
  let stbtc: EthereumStBTC
  const staker = EthereumAddress.from(ethers.Wallet.createRandom().address)

  const mockedContractInstance = {
    totalAssets: jest.fn(),
    balanceOf: jest.fn(),
    assetsBalanceOf: jest.fn(),
    entryFeeBasisPoints: jest.fn(),
  }

  beforeAll(() => {
    jest
      .spyOn(ethers, "Contract")
      .mockImplementationOnce(
        () => mockedContractInstance as unknown as Contract,
      )

    stbtc = new EthereumStBTC(
      {
        signer: {} as EthereumSigner,
      },
      "sepolia",
    )
  })

  describe("assetsBalanceOf", () => {
    const expectedResult = 48218274102123n
    let result: bigint

    beforeAll(async () => {
      mockedContractInstance.totalAssets.mockResolvedValue(expectedResult)
      result = await stbtc.totalAssets()
    })

    it("should call ethers contract instance", () => {
      expect(mockedContractInstance.totalAssets).toHaveBeenCalled()
    })

    it("should return value of assets that would be exchanged for the amount of shares owned by the staker ", () => {
      expect(result).toEqual(expectedResult)
    })
  })

  describe("balanceOf", () => {
    const expectedResult = 4294967295n
    let result: bigint

    beforeAll(async () => {
      mockedContractInstance.balanceOf.mockResolvedValue(expectedResult)
      result = await stbtc.balanceOf(staker)
    })

    it("should call ethers contract instance", () => {
      expect(mockedContractInstance.balanceOf).toHaveBeenCalledWith(
        `0x${staker.identifierHex}`,
      )
    })

    it("should return balance of stBTC tokens", () => {
      expect(result).toEqual(expectedResult)
    })
  })

  describe("assetsBalanceOf", () => {
    const expectedResult = 4294967295n
    let result: bigint

    beforeAll(async () => {
      mockedContractInstance.assetsBalanceOf.mockResolvedValue(expectedResult)
      result = await stbtc.assetsBalanceOf(staker)
    })

    it("should call ethers contract instance", () => {
      expect(mockedContractInstance.assetsBalanceOf).toHaveBeenCalledWith(
        `0x${staker.identifierHex}`,
      )
    })

    it("should return value of assets that would be exchanged for the amount of shares owned by the staker ", () => {
      expect(result).toEqual(expectedResult)
    })
  })

  describe("depositFee", () => {
    // 0.1 in 1e18 precision
    const amount = 100000000000000000n
    const mockedEntryFeeBasisPointsValue = 1n
    // (amount * basisPoints) / (basisPoints / 1e4)
    const expectedResult = 9999000099990n

    let result: bigint

    describe("when the entry fee basis points value is not yet cached", () => {
      beforeAll(async () => {
        mockedContractInstance.entryFeeBasisPoints.mockResolvedValue(
          mockedEntryFeeBasisPointsValue,
        )

        result = await stbtc.calculateDepositFee(amount)
      })

      it("should get the entry fee basis points from contract", () => {
        expect(mockedContractInstance.entryFeeBasisPoints).toHaveBeenCalled()
      })

      it("should calculate the deposit fee correctly", () => {
        expect(result).toEqual(expectedResult)
      })
    })

    describe("the entry fee basis points value is cached", () => {
      beforeAll(async () => {
        mockedContractInstance.entryFeeBasisPoints.mockResolvedValue(
          mockedEntryFeeBasisPointsValue,
        )

        await stbtc.calculateDepositFee(amount)

        result = await stbtc.calculateDepositFee(amount)
      })

      it("should get the entry fee basis points from cache", () => {
        expect(
          mockedContractInstance.entryFeeBasisPoints,
        ).toHaveBeenCalledTimes(1)
      })

      it("should calculate the deposit fee correctly", () => {
        expect(result).toEqual(expectedResult)
      })
    })
  })
})
