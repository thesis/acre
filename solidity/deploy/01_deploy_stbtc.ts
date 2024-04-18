import type { HardhatRuntimeEnvironment } from "hardhat/types"
import type { DeployFunction } from "hardhat-deploy/types"
import { waitForTransaction } from "../helpers/deployment"

const func: DeployFunction = async (hre: HardhatRuntimeEnvironment) => {
  const { getNamedAccounts, deployments, helpers } = hre
  const { treasury, governance } = await getNamedAccounts()
  const { deployer: deployerSigner } = await helpers.signers.getNamedSigners()

  let tbtc = await deployments.getOrNull("TBTC")
  if (hre.network.name === "integration") {
    tbtc = await deployments.getArtifact("TBTC")
  }

  const [, stbtcDeployment] = await helpers.upgrades.deployProxy("stBTC", {
    contractName: "stBTC",
    initializerArgs: [tbtc.address, treasury],
    factoryOpts: {
      signer: deployerSigner,
    },
    proxyOpts: {
      kind: "transparent",
      initialOwner: governance,
    },
  })

  if (stbtcDeployment.transactionHash && hre.network.tags.etherscan) {
    await waitForTransaction(hre, stbtcDeployment.transactionHash)
    await helpers.etherscan.verify(stbtcDeployment)
  }

  // TODO: Add Tenderly verification
}

export default func

func.tags = ["stBTC"]
func.dependencies = ["TBTC"]
