import { ethers } from "ethers"
import {
  EthereumEIP712Signer,
  EthereumAddress,
} from "../../../src/lib/ethereum"
import { EthereumSignedMessage } from "../../../src/lib/ethereum/eip712-signer/signed-message"

describe("EIP712", () => {
  describe("Signer", () => {
    const wallet = ethers.Wallet.createRandom()
    const provider = ethers.getDefaultProvider("sepolia")
    const ethersSigner = wallet.connect(provider)
    const signer = new EthereumEIP712Signer(ethersSigner)

    const domain = {
      name: "TBTCDepositor",
      version: "1",
      chainId: 1,
      verifyingContract: EthereumAddress.from(
        ethers.Wallet.createRandom().address,
      ),
    }

    const types = {
      Stake: [{ name: "receiver", type: "address" }],
    }

    const message = {
      receiver: "0x407C3329eA8f6BEFB984D97AE4Fa71945E43170b",
    }

    describe("sign", () => {
      const spyOnEthersSignTypedData = jest.spyOn(ethersSigner, "signTypedData")
      let result: EthereumSignedMessage

      beforeAll(async () => {
        // @ts-expect-error Error: Property '#typedMessage' is missing in type
        // 'ChainSignedMessage' but required in type 'EthereumSignedMessage'.
        // This is weird because the `typedMessage` is hard private field.
        result = await signer.sign(domain, types, message)
      })

      it("should sign message via ethers", () => {
        expect(spyOnEthersSignTypedData).toHaveBeenCalledWith(
          {
            ...domain,
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
  })

  describe("SignedMessage", () => {
    it("should verify message", () => {
      // TODO: add correct test checks.
      expect(true).toBeTruthy()
    })
  })
})
