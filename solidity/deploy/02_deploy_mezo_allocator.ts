import type { HardhatRuntimeEnvironment } from "hardhat/types"
import type { DeployFunction } from "hardhat-deploy/types"
import { waitForTransaction } from "../helpers/deployment"

const func: DeployFunction = async (hre: HardhatRuntimeEnvironment) => {
  const { getNamedAccounts, deployments, helpers } = hre
  const { governance } = await getNamedAccounts()
  const { deployer } = await helpers.signers.getNamedSigners()

  const stbtc = await deployments.get("stBTC")
  let tbtc = await deployments.getOrNull("TBTC")
  let mezoPortal = await deployments.getOrNull("MezoPortal")
  if (hre.network.name === "integration") {
    mezoPortal = await deployments.getArtifact("MezoPortal")
    tbtc = await deployments.getArtifact("TBTC")
  }

  const [, deployment] = await helpers.upgrades.deployProxy("MezoAllocator", {
    factoryOpts: {
      signer: deployer,
    },
    initializerArgs: [mezoPortal.address, tbtc.address, stbtc.address],
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

export default func

func.tags = ["MezoAllocator"]
func.dependencies = ["TBTC", "stBTC", "MezoPortal"]
