/* eslint-disable func-names */
import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers"

import { expect } from "chai"
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers"
import { ContractTransactionResponse } from "ethers"
import type { TbtcDepositor } from "../typechain"
import { deployment, getNamedSigner, getUnnamedSigner } from "./helpers"
import { beforeAfterSnapshotWrapper } from "./helpers/snapshot"

async function fixture() {
  const { tbtcDepositor } = await deployment()

  return { tbtcDepositor }
}

describe("TbtcDepositor", () => {
  let tbtcDepositor: TbtcDepositor

  let governance: HardhatEthersSigner
  let thirdParty: HardhatEthersSigner

  before(async () => {
    ;({ tbtcDepositor } = await loadFixture(fixture))
    ;({ governance } = await getNamedSigner())
    ;[thirdParty] = await getUnnamedSigner()
  })

  describe("initializeStake", () => {})

  describe("finalizeStake", () => {})

  describe("updateDepositorFeeDivisor", () => {
    beforeAfterSnapshotWrapper()

    context("when caller is not governance", () => {
      it("should revert", async () => {
        await expect(
          tbtcDepositor.connect(thirdParty).updateDepositorFeeDivisor(1234),
        )
          .to.be.revertedWithCustomError(
            tbtcDepositor,
            "OwnableUnauthorizedAccount",
          )
          .withArgs(thirdParty.address)
      })
    })

    context("when caller is governance", () => {
      const testUpdateDepositorFeeDivisor = (newValue: number) =>
        function () {
          beforeAfterSnapshotWrapper()

          let tx: ContractTransactionResponse

          before(async () => {
            tx = await tbtcDepositor
              .connect(governance)
              .updateDepositorFeeDivisor(newValue)
          })

          it("should emit DepositorFeeDivisorUpdated event", async () => {
            await expect(tx)
              .to.emit(tbtcDepositor, "DepositorFeeDivisorUpdated")
              .withArgs(newValue)
          })

          it("should update value correctly", async () => {
            expect(await tbtcDepositor.depositorFeeDivisor()).to.be.eq(newValue)
          })
        }

      describe(
        "when new value is non-zero",
        testUpdateDepositorFeeDivisor(47281),
      )

      describe("when new value is zero", testUpdateDepositorFeeDivisor(0))
    })
  })

  describe("calculateDepositKey", () => {})

  const extraDataValidTestData = new Map<
    string,
    {
      receiver: string
      referral: number
      extraData: string
    }
  >([
    [
      "receiver has leading zeros",
      {
        receiver: "0x000055d85E80A49B5930C4a77975d44f012D86C1",
        referral: 6851, // hex: 0x1ac3
        extraData:
          "0x000055d85e80a49b5930c4a77975d44f012d86c11ac300000000000000000000",
      },
    ],
    [
      "receiver has trailing zeros",
      {
        receiver: "0x2d2F8BC7923F7F806Dc9bb2e17F950b42CfE0000",
        referral: 6851, // hex: 0x1ac3
        extraData:
          "0x2d2f8bc7923f7f806dc9bb2e17f950b42cfe00001ac300000000000000000000",
      },
    ],
    [
      "referral is zero",
      {
        receiver: "0xeb098d6cDE6A202981316b24B19e64D82721e89E",
        referral: 0,
        extraData:
          "0xeb098d6cde6a202981316b24b19e64d82721e89e000000000000000000000000",
      },
    ],
    [
      "referral has leading zeros",
      {
        receiver: "0xeb098d6cDE6A202981316b24B19e64D82721e89E",
        referral: 31, // hex: 0x001f
        extraData:
          "0xeb098d6cde6a202981316b24b19e64d82721e89e001f00000000000000000000",
      },
    ],
    [
      "referral has trailing zeros",
      {
        receiver: "0xeb098d6cDE6A202981316b24B19e64D82721e89E",
        referral: 19712, // hex: 0x4d00
        extraData:
          "0xeb098d6cde6a202981316b24b19e64d82721e89e4d0000000000000000000000",
      },
    ],
    [
      "referral is maximum value",
      {
        receiver: "0xeb098d6cDE6A202981316b24B19e64D82721e89E",
        referral: 65535, // max uint16
        extraData:
          "0xeb098d6cde6a202981316b24b19e64d82721e89effff00000000000000000000",
      },
    ],
  ])

  describe("encodeExtraData", () => {
    extraDataValidTestData.forEach(
      ({ receiver, referral, extraData: expectedExtraData }, testName) => {
        it(testName, async () => {
          expect(
            await tbtcDepositor.encodeExtraData(receiver, referral),
          ).to.be.equal(expectedExtraData)
        })
      },
    )
  })

  describe("decodeExtraData", () => {
    extraDataValidTestData.forEach(
      (
        { receiver: expectedReceiver, referral: expectedReferral, extraData },
        testName,
      ) => {
        it(testName, async () => {
          const [actualReceiver, actualReferral] =
            await tbtcDepositor.decodeExtraData(extraData)

          expect(actualReceiver, "invalid receiver").to.be.equal(
            expectedReceiver,
          )
          expect(actualReferral, "invalid referral").to.be.equal(
            expectedReferral,
          )
        })
      },
    )

    it("with unused bytes filled with data", async () => {
      // Extra data uses address (20 bytes) and referral (2 bytes), leaving the
      // remaining 10 bytes unused. This test fills the unused bytes with a random
      // value.
      const extraData =
        "0xeb098d6cde6a202981316b24b19e64d82721e89e1ac3105f9919321ea7d75f58"
      const expectedReceiver = "0xeb098d6cDE6A202981316b24B19e64D82721e89E"
      const expectedReferral = 6851 // hex: 0x1ac3

      const [actualReceiver, actualReferral] =
        await tbtcDepositor.decodeExtraData(extraData)

      expect(actualReceiver, "invalid receiver").to.be.equal(expectedReceiver)
      expect(actualReferral, "invalid referral").to.be.equal(expectedReferral)
    })
  })
})
