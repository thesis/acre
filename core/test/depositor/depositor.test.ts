import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { ethers } from "hardhat";
import { expect } from "chai";
import { Depositor } from "../../typechain-types/contracts/depositor/Depositor";

async function deployDepositorFixture() {
  const Depositor = await ethers.getContractFactory("Depositor");
  const depositor = await Depositor.deploy();

  return { depositor };
}

const data = {
  bitcoin: {
    publicKey: {
      uncompressed:
        "04f4f3ac5daa51ec3dd5fb00bffe39c31fab780b66565bf9d33ee8d4aa3a0b96a575fd7a008d245d1c960877251c6d0b50e14e142bea6ccfb1b2020abe6e0b3949",
      x: "0xf4f3ac5daa51ec3dd5fb00bffe39c31fab780b66565bf9d33ee8d4aa3a0b96a5",
      y: "0x75fd7a008d245d1c960877251c6d0b50e14e142bea6ccfb1b2020abe6e0b3949",
    },
    signature: {
      messageHash:
        "0x55fc78ab5308b828b74bcf4852be2fb229d8cdc196cdaea7d8960282ca43dd69",
      messageSignature:
        "2019958eb693dd163d93796373ef830c2ceec57a475eb99c95ccfff9dd9d7f415718c7edc90dd3b7ce9940fb1381a0f03ab8e4d1ec5a87f2d386dc67e27a02e30f",
    },
  },
};

describe("Depositor", () => {
  let depositor: Depositor;

  before(async () => {
    const { depositor: _depositor } = await loadFixture(deployDepositorFixture);

    depositor = _depositor;
  });

  it("should deposit a given amount to an Ethereum address created based on the X and Y coordinates of ECDSA public key", async () => {
    const [signer] = await ethers.getSigners();

    const {
      uncompressed,
      x: publicKeyX,
      y: publicKeyY,
    } = data.bitcoin.publicKey;
    const amount = ethers.WeiPerEther;

    const expectedEthereumAddress = ethers.computeAddress(`0x${uncompressed}`);

    await depositor.connect(signer).deposit(publicKeyX, publicKeyY, amount);

    const balance = await depositor.balances(expectedEthereumAddress);

    expect(balance).to.eq(amount);
  });

  describe("withdraw", () => {
    const pubKeyX = data.bitcoin.publicKey.x;
    const pubKeyY = data.bitcoin.publicKey.y;

    before(async () => {
      const [signer] = await ethers.getSigners();
      const amount = ethers.WeiPerEther;

      await depositor.connect(signer).deposit(pubKeyX, pubKeyY, amount);
    });

    it("should withdraw deposited amount", async () => {
      const { messageSignature } = data.bitcoin.signature;

      const v = messageSignature.slice(0, 2);
      // Bitcoin signature uses `v` that is +4.
      const normalizedV = Number(`0x${v}`) - 4;
      const r = messageSignature.slice(2, 66);
      const s = messageSignature.slice(66, 130);

      await depositor.withdraw(
        pubKeyX,
        pubKeyY,
        normalizedV,
        `0x${r}`,
        `0x${s}`
      );

      const expectedEthereumAddress = ethers.computeAddress(
        `0x${data.bitcoin.publicKey.uncompressed}`
      );
      const balance = await depositor.balances(expectedEthereumAddress);

      expect(balance).to.eq(0);
    });
  });
});
