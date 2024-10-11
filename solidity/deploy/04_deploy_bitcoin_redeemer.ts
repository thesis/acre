import type { DeployFunction } from "hardhat-deploy/types"
import type { HardhatRuntimeEnvironment } from "hardhat/types"
import { waitForTransaction } from "../helpers/deployment"

const func: DeployFunction = async (hre: HardhatRuntimeEnvironment) => {
  const { deployments, helpers, getNamedAccounts } = hre
  const { governance } = await getNamedAccounts()
  const { deployer } = await helpers.signers.getNamedSigners()
  const { log } = deployments

  const tbtc = await deployments.get("TBTC")
  const stbtc = await deployments.get("stBTC")
  const tbtcVault = await deployments.get("TBTCVault")

  let deployment = await deployments.getOrNull("BitcoinRedeemer")
  if (deployment && helpers.address.isValid(deployment.address)) {
    log(`using BitcoinRedeemer at ${deployment.address}`)
  } else {
    ;[, deployment] = await helpers.upgrades.deployProxy("BitcoinRedeemer", {
      contractName: "BitcoinRedeemer",
      initializerArgs: [tbtc.address, stbtc.address, tbtcVault.address],
      factoryOpts: { signer: deployer },
      proxyOpts: {
        kind: "transparent",
        initialOwner: governance,
      },
    })

    if (deployment.transactionHash && hre.network.tags.etherscan) {
      await waitForTransaction(hre, deployment.transactionHash)
      await helpers.etherscan.verify(deployment)
    }

    // TODO: Add Tenderly verification
  }
}

export default func

func.tags = ["BitcoinRedeemer"]
func.dependencies = ["TBTC", "stBTC", "TBTCVault"]
