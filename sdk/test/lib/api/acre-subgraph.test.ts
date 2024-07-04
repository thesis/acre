import { EthereumAddress } from "@keep-network/tbtc-v2.ts"
import { ethers } from "ethers"
import * as AcreSubgraphApiModule from "../../../src/lib/api/AcreSubgraphApi"
import AcreSubgraphApi, {
  TbtcSubgraph,
  buildGetDepositsByOwnerQuery,
  buildGetWithdrawalsByOwnerQuery,
  buildSearchRedemptionsByIdQuery,
} from "../../../src/lib/api/AcreSubgraphApi"
import { DepositStatus } from "../../../src/lib/api/TbtcApi"
import { Hex } from "../../../src/lib/utils"

const subgraphData = {
  data: {
    deposits: [
      {
        id: "0x35a0ef1f1b41e5dbe56f5c02c9902ca4317f587e352d9fc8859af4e569b80c1f",
        bitcoinTransactionId:
          "6349459ccb07419a7184577adf7a992216a214792e45ad2a689127d14c7a4cb9",
        initialDepositAmount: "1200000000000000",
        events: [
          {
            timestamp: "1714058004",
            type: "Initialized",
          },
        ],
        amountToDeposit: null,
      },
      {
        id: "0x73661e3ee3c6c30988800e5fedc081f29c6540505383fcfcd172fd10f3a73139",
        bitcoinTransactionId:
          "6bca75ba55334c25064e7bf5333a3b39ed5bb73fb17e73ea9e55e6294e3fbf65",
        initialDepositAmount: "1040000000000000",
        events: [
          {
            timestamp: "1715856144",
            type: "Initialized",
          },
          {
            timestamp: "1715860572",
            type: "Finalized",
          },
        ],
        amountToDeposit: "536361040000000",
      },
    ],
  },
}

const expectedDepositData = [
  {
    depositKey:
      "0x35a0ef1f1b41e5dbe56f5c02c9902ca4317f587e352d9fc8859af4e569b80c1f",
    txHash: "6349459ccb07419a7184577adf7a992216a214792e45ad2a689127d14c7a4cb9",
    initialAmount: BigInt("1200000000000000"),
    amountToDeposit: BigInt(0),
    type: "deposit",
    status: DepositStatus.Initialized,
    timestamp: 1714058004,
  },
  {
    depositKey:
      "0x73661e3ee3c6c30988800e5fedc081f29c6540505383fcfcd172fd10f3a73139",
    txHash: "6bca75ba55334c25064e7bf5333a3b39ed5bb73fb17e73ea9e55e6294e3fbf65",
    initialAmount: BigInt("1040000000000000"),
    amountToDeposit: BigInt("536361040000000"),
    type: "deposit",
    status: DepositStatus.Finalized,
    timestamp: 1715856144,
  },
]

const tbtcSubgraphData = {
  data: {
    searchRedemption: [
      {
        id: "0x047078deab9f2325ce5adc483d6b28dfb32547017ffb73f857482b51b622d5eb-0",
        completedTxHash:
          "0x844b472231eaaeba765e375dad992c7468deaa81b42d2977cebbf441069b2001",
      },
      {
        id: "0xa40df409c4e463cb0c7744df310ad8714a01c40bcf6807cb2b4266ffa0b860ea-0",
        completedTxHash: null,
      },
    ],
  },
}
const acreSubgraphWithdrawalsData = {
  data: {
    withdraws: [
      {
        id: "0x047078deab9f2325ce5adc483d6b28dfb32547017ffb73f857482b51b622d5eb-1",
        bitcoinTransactionId: null,
        amount: "10000000000000000",
        events: [
          {
            timestamp: "1718871276",
            type: "Initialized",
          },
        ],
      },
      {
        id: "0xa40df409c4e463cb0c7744df310ad8714a01c40bcf6807cb2b4266ffa0b860ea-1",
        bitcoinTransactionId: null,
        amount: "10000000000000000",
        events: [
          {
            timestamp: "1718889168",
            type: "Initialized",
          },
        ],
      },
    ],
  },
}

const expectedWithdrawalsData = [
  {
    id: "0x047078deab9f2325ce5adc483d6b28dfb32547017ffb73f857482b51b622d5eb-1",
    bitcoinTransactionId: Hex.from(
      "0x844b472231eaaeba765e375dad992c7468deaa81b42d2977cebbf441069b2001",
    )
      .reverse()
      .toString(),
    amount: 10000000000000000n,
    timestamp: 1718871276,
  },
  {
    id: "0xa40df409c4e463cb0c7744df310ad8714a01c40bcf6807cb2b4266ffa0b860ea-1",
    bitcoinTransactionId: undefined,
    amount: 10000000000000000n,
    timestamp: 1718889168,
  },
]

describe("Acre Subgraph API", () => {
  const subgraphApiUrl = "https://subgraph.test"
  const tbtcSubgraphApiUrl = "https://tbtc.subgraph.test"
  const subgraph = new AcreSubgraphApi(subgraphApiUrl, tbtcSubgraphApiUrl)

  const mockTbtcSubgraphApi = {
    getRedemptionsByIds: jest.fn(),
  } as unknown as TbtcSubgraph

  jest
    .spyOn(AcreSubgraphApiModule, "TbtcSubgraph")
    .mockReturnValue(mockTbtcSubgraphApi)

  const depositOwnerId = EthereumAddress.from(
    ethers.Wallet.createRandom().address,
  )

  describe("getDepositsByOwner", () => {
    const spyOnFetch = jest.spyOn(global, "fetch").mockImplementationOnce(() =>
      // @ts-expect-error We only mock fields/methods used in the code.
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(subgraphData),
      }),
    )

    const mockedURLObject = {} as URL
    const spyOnURL = jest
      .spyOn(global, "URL")
      .mockReturnValueOnce(mockedURLObject)

    const query = buildGetDepositsByOwnerQuery(depositOwnerId)

    let result: Awaited<ReturnType<AcreSubgraphApi["getDepositsByOwner"]>>

    beforeAll(async () => {
      result = await subgraph.getDepositsByOwner(depositOwnerId)
    })

    afterAll(() => {
      spyOnFetch.mockClear()
      spyOnURL.mockClear()
    })

    it("should create the URL object", () => {
      expect(spyOnURL).toHaveBeenCalledWith("", subgraphApiUrl)
    })

    it("should send POST request", () => {
      expect(spyOnFetch).toHaveBeenCalledWith(mockedURLObject, {
        method: "POST",
        body: JSON.stringify({ query }),
        credentials: undefined,
        headers: { "Content-Type": "application/json" },
      })
    })

    it("should return correct data", () => {
      expect(result).toStrictEqual(expectedDepositData)
    })
  })

  describe("getWithdrawalsByOwner", () => {
    const spyOnFetch = jest
      .spyOn(global, "fetch")
      .mockImplementationOnce(() =>
        // @ts-expect-error We only mock fields/methods used in the code.
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve(acreSubgraphWithdrawalsData),
        }),
      )
      .mockImplementationOnce(() =>
        // @ts-expect-error We only mock fields/methods used in the code.
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve(tbtcSubgraphData),
        }),
      )

    const mockedURLObject = {} as URL
    const mockedTbtcUrlObject = {} as URL
    const spyOnURL = jest
      .spyOn(global, "URL")
      .mockReturnValueOnce(mockedURLObject)
      .mockReturnValueOnce(mockedTbtcUrlObject)

    const query = buildGetWithdrawalsByOwnerQuery(depositOwnerId)
    const ids: string[] = expectedWithdrawalsData.map((withdraw) => withdraw.id)
    const tbtcSubgraphQuery = buildSearchRedemptionsByIdQuery(ids)

    let result: Awaited<ReturnType<AcreSubgraphApi["getWithdrawalsByOwner"]>>

    beforeAll(async () => {
      result = await subgraph.getWithdrawalsByOwner(depositOwnerId)
    })

    it("should create the URL object for Acre subgraph", () => {
      expect(spyOnURL).toHaveBeenNthCalledWith(1, "", subgraphApiUrl)
    })

    it("should create the URL object for tBTC subgraph", () => {
      expect(spyOnURL).toHaveBeenNthCalledWith(2, "", tbtcSubgraphApiUrl)
    })

    it("should send POST request to Acre subgraph", () => {
      expect(spyOnFetch).toHaveBeenNthCalledWith(1, mockedURLObject, {
        method: "POST",
        body: JSON.stringify({ query }),
        credentials: undefined,
        headers: { "Content-Type": "application/json" },
      })
    })

    it("should send POST request to tBTC subgraph", () => {
      expect(spyOnFetch).toHaveBeenNthCalledWith(2, mockedTbtcUrlObject, {
        method: "POST",
        body: JSON.stringify({ query: tbtcSubgraphQuery }),
        credentials: undefined,
        headers: { "Content-Type": "application/json" },
      })
    })

    it("should return correct data", () => {
      expect(result).toMatchObject(expectedWithdrawalsData)
    })
  })
})
