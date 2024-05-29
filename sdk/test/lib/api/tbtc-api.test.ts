import { EthereumAddress } from "@keep-network/tbtc-v2.ts"
import { ethers } from "ethers"
import TbtcApi from "../../../src/lib/api/TbtcApi"
import { tbtcApiDeposits } from "../../data/deposit"

describe("tTBC API", () => {
  const tbtcApiUrl = " https://tbtc-api.test/"
  const tbtcApi = new TbtcApi(tbtcApiUrl)

  describe("getDepositsByOwner", () => {
    const depositOwnerId = EthereumAddress.from(
      ethers.Wallet.createRandom().address,
    )
    const spyOnFetch = jest.spyOn(global, "fetch").mockImplementationOnce(() =>
      // @ts-expect-error We only mock fields/methods used in the code.
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(tbtcApiDeposits),
      }),
    )

    const mockedURLObject = {} as URL
    const spyOnURL = jest
      .spyOn(global, "URL")
      .mockReturnValueOnce(mockedURLObject)

    let result: Awaited<ReturnType<TbtcApi["getDepositsByOwner"]>>

    beforeAll(async () => {
      result = await tbtcApi.getDepositsByOwner(depositOwnerId)
    })

    it("should create the URL object", () => {
      expect(spyOnURL).toHaveBeenCalledWith(
        `deposits/${depositOwnerId.identifierHex}`,
        tbtcApiUrl,
      )
    })

    it("should send GET request", () => {
      expect(spyOnFetch).toHaveBeenCalledWith(mockedURLObject, {
        credentials: "include",
      })
    })

    it("should return correct data", () => {
      expect(result).toStrictEqual(tbtcApiDeposits)
    })
  })
})
