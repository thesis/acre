import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { ethers } from "hardhat";
import { expect } from "chai";
import { Depositor } from "../../typechain-types/contracts/depositor/Depositor";

async function deployDepositorFixture() {
  const [account] = await ethers.getSigners();

  const Depositor = await ethers.getContractFactory("Depositor");
  const depositor = await Depositor.deploy();

  return { depositor };
}

const data = {
  bitcoin: {
    publicKey: {
      uncompressed:
        "0450863ad64a87ae8a2fe83c1af1a8403cb53f53e486d8511dad8a04887e5b23522cd470243453a299fa9e77237716103abc11a1df38855ed6f2ee187e9c582ba6",
      x: "0x50863ad64a87ae8a2fe83c1af1a8403cb53f53e486d8511dad8a04887e5b2352",
      y: "0x2cd470243453a299fa9e77237716103abc11a1df38855ed6f2ee187e9c582ba6",
    },
    signature: {
      v: "",
      r: "",
      s: "",
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
    const amount = ethers.WeiPerEther

    const expectedEthereumAddress = ethers.computeAddress(`0x${uncompressed}`);

    await depositor.connect(signer).deposit(publicKeyX, publicKeyY, amount);

    const balance = await depositor.balances(expectedEthereumAddress);

    expect(balance).to.eq(amount);
  });
});
