import type { DeployFunction } from "hardhat-deploy/types"
import type { HardhatRuntimeEnvironment } from "hardhat/types"
import waitForTransaction from "../helpers/deployment"

const func: DeployFunction = async (hre: HardhatRuntimeEnvironment) => {
  const { deployments, helpers } = hre
  const { deployer } = await helpers.signers.getNamedSigners()

  const tbtc = await deployments.get("TBTC")
  const stbtc = await deployments.get("stBTC")

  const [_, bitcoinRedeemerDeployment] = await helpers.upgrades.deployProxy(
    "BitcoinRedeemer",
    {
      contractName: "BitcoinRedeemer",
      initializerArgs: [tbtc.address, stbtc.address],
      factoryOpts: { signer: deployer },
      proxyOpts: {
        kind: "transparent",
      },
    },
  )

  if (bitcoinRedeemerDeployment.transactionHash && hre.network.tags.etherscan) {
    await waitForTransaction(hre, bitcoinRedeemerDeployment.transactionHash)
    await helpers.etherscan.verify(bitcoinRedeemerDeployment)
  }

  // TODO: Add Tenderly verification
}

export default func

func.tags = ["BitcoinRedeemer"]
func.dependencies = ["TBTC", "stBTC"]
