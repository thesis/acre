import type { DeployFunction } from "hardhat-deploy/types"
import type { HardhatRuntimeEnvironment } from "hardhat/types"
import { waitForTransaction } from "../helpers/deployment"

const func: DeployFunction = async (hre: HardhatRuntimeEnvironment) => {
  const { deployments, helpers, getNamedAccounts } = hre
  const { governance } = await getNamedAccounts()
  const { deployer } = await helpers.signers.getNamedSigners()
  const { log } = deployments

  const tbtc = await deployments.get("TBTC")
  const bridge = await deployments.get("Bridge")
  const tbtcVault = await deployments.get("TBTCVault")
  const stbtc = await deployments.get("stBTC")

  let deployment = await deployments.getOrNull("BitcoinDepositor")
  if (deployment && helpers.address.isValid(deployment.address)) {
    log(`using BitcoinDepositor at ${deployment.address}`)
  } else {
    ;[, deployment] = await helpers.upgrades.deployProxy("BitcoinDepositor", {
      factoryOpts: {
        signer: deployer,
      },
      initializerArgs: [
        bridge.address,
        tbtcVault.address,
        tbtc.address,
        stbtc.address,
      ],
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

func.tags = ["BitcoinDepositor"]
func.dependencies = ["TBTC", "stBTC"]
