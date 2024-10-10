import type { DeployFunction } from "hardhat-deploy/types"
import type { HardhatRuntimeEnvironment } from "hardhat/types"
import { waitForTransaction } from "../helpers/deployment"

const func: DeployFunction = async (hre: HardhatRuntimeEnvironment) => {
  const { deployments, helpers } = hre
  const { deployer } = await helpers.signers.getNamedSigners()

  const mezoPortal = await deployments.get("MezoPortal")

  const [_, deployment] = await helpers.upgrades.deployProxy(
    "AcreMultiAssetVault",
    {
      contractName: "AcreMultiAssetVault",
      initializerArgs: [mezoPortal.address],
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

func.tags = ["AcreMultiAssetVault"]
func.dependencies = ["MezoPortal"]
// TODO: Uncomment after contracts are deployed to mainnet.
// func.skip = async (hre: HardhatRuntimeEnvironment): Promise<boolean> =>
//   Promise.resolve(hre.network.name === "integration")
