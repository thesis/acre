import { EthereumAddress } from "@keep-network/tbtc-v2.ts"
import { AcreContracts } from "../../src/lib/contracts"
import { StakingModule } from "../../src/modules/staking"
import { MockAcreContracts } from "../utils/mock-acre-contracts"
import { MockMessageSigner } from "../utils/mock-message-signer"
import { MockTBTC } from "../utils/mock-tbtc"
import { StakeInitialization } from "../../src/modules/staking/stake-initialization"

describe("Staking", () => {
  const contracts: AcreContracts = new MockAcreContracts()
  const messageSigner = new MockMessageSigner()
  const tbtc = new MockTBTC()

  const staking: StakingModule = new StakingModule(
    contracts,
    messageSigner,
    tbtc,
  )

  describe("initializeStake", () => {
    let result: StakeInitialization
    const bitcoinRecoveryAddress = "mjc2zGWypwpNyDi4ZxGbBNnUA84bfgiwYc"
    const mockedDepositBTCAddress =
      "tb1qma629cu92skg0t86lftyaf9uflzwhp7jk63h6mpmv3ezh6puvdhs6w2r05"
    const mockedDeposit = {
      getBitcoinAddress: jest.fn().mockResolvedValue(mockedDepositBTCAddress),
    }
    const mockedSignedMessage = { verify: jest.fn() }

    beforeAll(async () => {
      tbtc.deposits.initiateDeposit = jest.fn().mockReturnValue(mockedDeposit)
      messageSigner.sign = jest.fn().mockResolvedValue(mockedSignedMessage)

      result = await staking.initializeStake(bitcoinRecoveryAddress)
    })

    it("should sign message", () => {
      expect(messageSigner.sign).toHaveBeenCalledWith("message")
    })

    it("should initiate tBTC deposit", () => {
      expect(tbtc.deposits.initiateDeposit).toHaveBeenCalledWith(
        bitcoinRecoveryAddress,
      )
    })

    it("should return stake initialization object", async () => {
      expect(result).toBeInstanceOf(StakeInitialization)
      expect(result.getDepositAddress).toBeDefined()
      expect(result.stake).toBeDefined()
    })

    describe("StakeInitialization", () => {
      describe("getDepositAddress", () => {
        it("should return bitcoin deposit address", async () => {
          expect(await result.getDepositAddress()).toBe(mockedDepositBTCAddress)
        })
      })

      describe("stake", () => {
        const receiver = EthereumAddress.from(
          "0x086813525A7dC7dafFf015Cdf03896Fd276eab60",
        )

        beforeAll(() => {
          mockedSignedMessage.verify.mockReturnValue(receiver)
        })

        describe("when the receiver address doesn't match the address recovered from signature", () => {
          const invalidReceiver = EthereumAddress.from(
            "0x407C3329eA8f6BEFB984D97AE4Fa71945E43170b",
          )

          it("should throw an error", () => {
            expect(async () => {
              await result.stake(invalidReceiver)
            }).rejects.toThrow("Invalid receiver address")
          })
        })
      })
    })
  })
})
