import type { DeployFunction } from "hardhat-deploy/types"
import type { HardhatRuntimeEnvironment } from "hardhat/types"
import { waitForTransaction } from "../helpers/deployment"

const func: DeployFunction = async (hre: HardhatRuntimeEnvironment) => {
  const { deployments, helpers } = hre
  const { deployer } = await helpers.signers.getNamedSigners()

  let tbtc = await deployments.getOrNull("TBTC")
  if (hre.network.name === "integration") {
    tbtc = await deployments.getArtifact("TBTC")
  }
  const stbtc = await deployments.get("stBTC")
  const tbtcVault = await deployments.get("TBTCVault")

  const [_, deployment] = await helpers.upgrades.deployProxy(
    "BitcoinRedeemer",
    {
      contractName: "BitcoinRedeemer",
      initializerArgs: [tbtc.address, stbtc.address, tbtcVault.address],
      factoryOpts: { signer: deployer },
      proxyOpts: {
        kind: "transparent",
      },
    },
  )

  if (deployment.transactionHash && hre.network.tags.etherscan) {
    await waitForTransaction(hre, deployment.transactionHash)
    await helpers.etherscan.verify(deployment)
  }

  // TODO: Add Tenderly verification
}

export default func

func.tags = ["BitcoinRedeemer"]
func.dependencies = ["TBTC", "stBTC", "TBTCVault"]
