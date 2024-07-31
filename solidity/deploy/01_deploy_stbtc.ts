import type { HardhatRuntimeEnvironment } from "hardhat/types"
import type { DeployFunction } from "hardhat-deploy/types"
import { waitForTransaction } from "../helpers/deployment"

const func: DeployFunction = async (hre: HardhatRuntimeEnvironment) => {
  const { getNamedAccounts, deployments, helpers } = hre
  const { treasury, governance } = await getNamedAccounts()
  const { deployer: deployerSigner } = await helpers.signers.getNamedSigners()

  const tbtc = await deployments.get("TBTC")

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
func.skip = async (hre: HardhatRuntimeEnvironment): Promise<boolean> =>
  Promise.resolve(hre.network.name === "integration")
