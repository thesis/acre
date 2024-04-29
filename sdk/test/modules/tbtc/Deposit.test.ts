import { Deposit as TbtcSdkDeposit } from "@keep-network/tbtc-v2.ts"
import TbtcApi, { DepositStatus } from "../../../src/api/TbtcApi"
import Deposit from "../../../src/modules/tbtc/Deposit"

import { fundingUtxo, revealTestData } from "../../data/deposit"

describe("Deposit", () => {
  const tbtcApi: TbtcApi = new TbtcApi("https://api.acre.fi/v1/deposit/")
  const tbtcSdkDeposit: TbtcSdkDeposit = jest.fn() as unknown as TbtcSdkDeposit

  let deposit: Deposit

  beforeAll(() => {
    tbtcSdkDeposit.detectFunding = jest.fn()

    deposit = new Deposit(tbtcApi, tbtcSdkDeposit, revealTestData)
  })

  describe("waitForFunding", () => {
    describe("when waiting for bitcoin deposit tx", () => {
      describe("when can't find transaction after max number of retries", () => {
        beforeAll(() => {
          jest.useFakeTimers()

          jest
            .spyOn(tbtcSdkDeposit, "detectFunding")
            .mockClear()
            .mockResolvedValue([])
        })

        it("should throw an error", async () => {
          // eslint-disable-next-line no-void
          void expect(
            deposit.waitForFunding({
              retries: 5,
              backoffStepMs: 1234,
            }),
          ).rejects.toThrow("Deposit not funded yet")

          await jest.runAllTimersAsync()

          expect(tbtcSdkDeposit.detectFunding).toHaveBeenCalledTimes(6)
        })
      })

      describe("when the funding tx is available", () => {
        let txPromise: Promise<void>

        beforeAll(async () => {
          jest.useFakeTimers()

          jest
            .spyOn(tbtcSdkDeposit, "detectFunding")
            .mockClear()
            // First attempt. Deposit not funded yet.
            .mockResolvedValueOnce([])
            // Second attempt. Deposit not funded yet.
            .mockResolvedValueOnce([])
            // Third attempt. Deposit funded.
            .mockResolvedValueOnce([fundingUtxo])

          txPromise = deposit.waitForFunding({
            retries: 95,
            backoffStepMs: 1234,
          })

          await jest.runAllTimersAsync()
        })

        it("should wait for deposit transaction", () => {
          expect(tbtcSdkDeposit.detectFunding).toHaveBeenCalledTimes(3)
        })

        it("should resolve promise", async () => {
          await txPromise
        })
      })
    })
  })

  describe("createDeposit", () => {
    const mockedDepositId = "some-deposit-id"

    beforeAll(() => {
      jest.spyOn(tbtcApi, "createDeposit").mockResolvedValue({
        depositId: mockedDepositId,
        depositStatus: DepositStatus.Queued,
        fundingOutpoint: fundingUtxo,
      })
    })

    afterAll(() => {
      jest.spyOn(tbtcApi, "createDeposit").mockClear()
    })

    it("should create a deposit in tBTC API", async () => {
      await deposit.createDeposit()

      expect(tbtcApi.createDeposit).toHaveBeenCalledWith({
        depositReceipt: revealTestData.revealInfo,
        depositOwner: revealTestData.metadata.depositOwner,
        referral: revealTestData.metadata.referral,
      })
    })
  })
})
