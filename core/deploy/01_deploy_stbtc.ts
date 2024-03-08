import type { HardhatRuntimeEnvironment } from "hardhat/types"
import type { DeployFunction } from "hardhat-deploy/types"

const func: DeployFunction = async (hre: HardhatRuntimeEnvironment) => {
  const { getNamedAccounts, deployments, helpers } = hre
  const { treasury } = await getNamedAccounts()
  const { deployer: deployerSigner } = await helpers.signers.getNamedSigners()

  const tbtc = await deployments.get("TBTC")

  const [, proxyDeployment] = await helpers.upgrades.deployProxy("stBTC", {
    contractName: "stBTC",
    initializerArgs: [tbtc.address, treasury],
    factoryOpts: {
      signer: deployerSigner,
    },
    proxyOpts: {
      kind: "transparent",
    },
  })

  if (hre.network.tags.etherscan) {
    await helpers.etherscan.verify(proxyDeployment)
  }

  // TODO: Add Tenderly verification
}

export default func

func.tags = ["stBTC"]
func.dependencies = ["TBTC"]
