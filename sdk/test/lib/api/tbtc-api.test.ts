import { EthereumAddress } from "@keep-network/tbtc-v2.ts"
import { ethers } from "ethers"
import TbtcApi from "../../../src/lib/api/TbtcApi"

const apiDeposits = [
  {
    id: "ca9e0aa1-e817-4ebd-987e-22192c9d587f",
    txHash: "1e0d6554a501ba5b0924ca81d65e1a917dcf0eca8b1fab5447bdb8aff6e079f9",
    outputIndex: 0,
    initialAmount: "1000000000000000",
    receipt: {
      depositor: "2f86fe8c5683372db667e6f6d88dcb6d55a81286",
      blindingFactor: "9218e55872c69e7f",
      walletPublicKeyHash: "ebef9a6ea7e6d946fc566fb0660b3c841fbd8e74",
      refundPublicKeyHash: "970a1068ba42cc8c5a09e7d98918a3ed4d7692c0",
      refundLocktime: "a618a967",
      extraData:
        "f462886f898aff2702d51674aed7c0fe05999dad007b00000000000000000000",
    },
    owner: "f462886f898aff2702d51674aed7c0fe05999dad",
    referral: 123,
    status: "FINALIZED",
    createdAt: 1715807188,
  },
  {
    id: "00aae4da-989b-46d2-bc2d-cbb234b819d9",
    txHash: "99299f05458a0a31b1e34a375bf688bff0f488797c4171e657f62fe83e656d15",
    outputIndex: 0,
    initialAmount: "1100000000000000",
    receipt: {
      depositor: "2f86fe8c5683372db667e6f6d88dcb6d55a81286",
      blindingFactor: "4d25ab061ae21369",
      walletPublicKeyHash: "ebef9a6ea7e6d946fc566fb0660b3c841fbd8e74",
      refundPublicKeyHash: "970a1068ba42cc8c5a09e7d98918a3ed4d7692c0",
      refundLocktime: "4ec6a967",
      extraData:
        "f462886f898aff2702d51674aed7c0fe05999dad007b00000000000000000000",
    },
    owner: "f462886f898aff2702d51674aed7c0fe05999dad",
    referral: 123,
    status: "FINALIZED",
    createdAt: 1715851724,
  },
]

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
        json: () => Promise.resolve(apiDeposits),
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
      expect(result).toStrictEqual(apiDeposits)
    })
  })
})
