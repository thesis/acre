import type { HardhatRuntimeEnvironment } from "hardhat/types"
import type { DeployFunction } from "hardhat-deploy/types"

const func: DeployFunction = async (hre: HardhatRuntimeEnvironment) => {
  const { deployments, helpers } = hre
  let { governance } = await helpers.signers.getNamedSigners()

  if (hre.network.name === "integration" || hre.network.name === "fork") {
    governance = await helpers.account.impersonateAccount(governance.address)
  }

  const { newImplementationAddress, preparedTransaction } =
    await helpers.upgrades.prepareProxyUpgrade(
      "MezoAllocator",
      "MezoAllocator",
      {
        contractName: "contracts/MezoAllocator.sol:MezoAllocator",
      },
    )

  if (hre.network.name !== "mainnet") {
    deployments.log("Sending transaction to upgrade implementation...")
    await governance.sendTransaction(preparedTransaction)
  }

  if (hre.network.tags.etherscan) {
    // We use `verify` instead of `verify:verify` as the `verify` task is defined
    // in "@openzeppelin/hardhat-upgrades" to verify the proxy’s implementation
    // contract, the proxy itself and any proxy-related contracts, as well as
    // link the proxy to the implementation contract’s ABI on (Ether)scan.
    await hre.run("verify", {
      address: newImplementationAddress,
    })
  }

  // TODO: Add Tenderly verification
}

export default func

func.tags = ["UpgradeMezoAllocator"]
// When running an upgrade uncomment the skip below and run the command:
// yarn deploy --tags UpgradeMezoAllocator --network <NETWORK>
func.skip = async () => Promise.resolve(true)
