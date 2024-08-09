import type { HardhatRuntimeEnvironment } from "hardhat/types"
import type { DeployFunction } from "hardhat-deploy/types"

const func: DeployFunction = async (hre: HardhatRuntimeEnvironment) => {
  const { deployments, helpers } = hre
  let { governance } = await helpers.signers.getNamedSigners()

  if (hre.network.name === "integration") {
    governance = await helpers.account.impersonateAccount(governance.address)
  }

  const { newImplementationAddress, preparedTransaction } =
    await helpers.upgrades.prepareProxyUpgrade("stBTC", "stBTC", {
      contractName: "contracts/stBTC.sol:stBTC",
    })

  if (hre.network.name !== "mainnet") {
    deployments.log("Sending transaction to upgrade implementation...")
    const tx = await governance.sendTransaction(preparedTransaction)
    await tx.wait()

    deployments.log(`Transaction completed: ${tx?.hash}`)
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

func.tags = ["UpgradeStBTC"]
// When running an upgrade uncomment the skip below and run the command:
// yarn deploy --tags UpgradeStBTC --network <NETWORK>
func.skip = async () => Promise.resolve(true)
