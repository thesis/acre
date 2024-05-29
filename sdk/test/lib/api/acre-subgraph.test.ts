import { EthereumAddress } from "@keep-network/tbtc-v2.ts"
import { ethers } from "ethers"
import AcreSubgraphApi from "../../../src/lib/api/AcreSubgraphApi"
import { DepositStatus } from "../../../src/lib/api/TbtcApi"

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

describe("Acre Subgraph API", () => {
  const subgraphApiUrl = " https://subgraph.test"
  const subgraph = new AcreSubgraphApi(subgraphApiUrl)

  describe("getDepositsByOwner", () => {
    const depositOwnerId = EthereumAddress.from(
      ethers.Wallet.createRandom().address,
    )
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

    const query = `
    query {
      deposits(
            where: {depositOwner_: {id: "0x${depositOwnerId.identifierHex}"}}
        ) {
            id
            bitcoinTransactionId
            initialDepositAmount
            events(orderBy: timestamp, orderDirection: asc) {
              timestamp
              type
            }
            amountToDeposit
        }
    }`

    let result: Awaited<ReturnType<AcreSubgraphApi["getDepositsByOwner"]>>

    beforeAll(async () => {
      result = await subgraph.getDepositsByOwner(depositOwnerId)
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
})
