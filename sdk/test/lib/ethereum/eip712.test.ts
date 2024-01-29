import { Network, ethers } from "ethers"
import {
  EthereumEIP712Signer,
  EthereumAddress,
  EthereumSignedMessage,
} from "../../../src"

const signMessageData = {
  domain: {
    name: "TBTCDepositor",
    version: "1",
    verifyingContract: EthereumAddress.from(
      ethers.Wallet.createRandom().address,
    ),
  },
  types: {
    Stake: [{ name: "receiver", type: "address" }],
  },
  message: {
    receiver: "0x407C3329eA8f6BEFB984D97AE4Fa71945E43170b",
  },
}

describe("EIP712", () => {
  const wallet = ethers.Wallet.createRandom()
  const provider = ethers.getDefaultProvider("sepolia")
  const ethersSigner = wallet.connect(provider)
  const signer = new EthereumEIP712Signer(ethersSigner)

  describe("Signer", () => {
    describe("sign", () => {
      describe("when chain id is defined", () => {
        const { domain, types, message } = signMessageData
        let spyOnEthersSignTypedData: jest.SpyInstance<Promise<string>>
        let result: EthereumSignedMessage

        beforeAll(async () => {
          spyOnEthersSignTypedData = jest.spyOn(ethersSigner, "signTypedData")

          // @ts-expect-error Error: `Property '#typedMessage' is missing in type
          // 'ChainSignedMessage' but required in type 'EthereumSignedMessage'`.
          // This is weird because the `typedMessage` is hard private field.
          result = await signer.sign(domain, types, message)
        })

        it("should sign message via ethers", async () => {
          expect(spyOnEthersSignTypedData).toHaveBeenCalledWith(
            {
              ...domain,
              chainId: (await ethersSigner.provider?.getNetwork())?.chainId,
              verifyingContract: `0x${domain.verifyingContract.identifierHex}`,
              salt: undefined,
            },
            types,
            message,
          )
        })

        it("should return signed message", () => {
          expect(result).toBeInstanceOf(EthereumSignedMessage)
        })
      })

      describe("when chain id is not defined", () => {
        let spyOnGetNetwork: jest.SpyInstance<Promise<Network>>

        beforeAll(() => {
          spyOnGetNetwork = jest
            .spyOn(provider, "getNetwork")
            .mockResolvedValue({} as unknown as Network)
        })

        afterAll(() => {
          spyOnGetNetwork.mockRestore()
        })

        it("should throw an error", async () => {
          const { domain, types, message } = signMessageData

          await expect(signer.sign(domain, types, message)).rejects.toThrow(
            "Chain id not defined",
          )
        })
      })
    })
  })

  describe("SignedMessage", () => {
    const { domain, types, message } = signMessageData
    let signedMessage: EthereumSignedMessage

    beforeAll(async () => {
      // @ts-expect-error Error: `Property '#typedMessage' is missing in type
      // 'ChainSignedMessage' but required in type 'EthereumSignedMessage'`.
      // This is weird because the `typedMessage` is hard private field.
      signedMessage = await signer.sign(domain, types, message)
    })

    describe("verify", () => {
      it("should return Ethereum address from signature", () => {
        const expectedAddress = EthereumAddress.from(ethersSigner.address)

        expect(signedMessage.verify()).toStrictEqual(expectedAddress)
      })
    })

    describe("signature parameters", () => {
      let v: number
      let r: string
      let s: string

      beforeAll(() => {
        ;({ v, r, s } = ethers.Signature.from(
          signedMessage.signature.toPrefixedString(),
        ))
      })

      it("should return correct v value", () => {
        expect(signedMessage.v).toBe(v)
      })

      it("should return correct r value", () => {
        expect(signedMessage.r.toPrefixedString()).toBe(r)
      })

      it("should return correct s value", () => {
        expect(signedMessage.s.toPrefixedString()).toBe(s)
      })
    })
  })
})
