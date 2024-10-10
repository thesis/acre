import type { HardhatRuntimeEnvironment } from "hardhat/types"
import type { DeployFunction } from "hardhat-deploy/types"
import { waitConfirmationsNumber } from "../helpers/deployment"

const func: DeployFunction = async (hre: HardhatRuntimeEnvironment) => {
  const { getNamedAccounts, deployments } = hre
  const { deployer, governance } = await getNamedAccounts()
  const { log } = deployments

  log(`transferring ownership of AcreMultiAssetVault contract to ${governance}`)

  await deployments.execute(
    "AcreMultiAssetVault",
    {
      from: deployer,
      log: true,
      waitConfirmations: waitConfirmationsNumber(hre),
    },
    "transferOwnership",
    governance,
  )

  if (hre.network.name !== "mainnet" && hre.network.name !== "integration") {
    await deployments.execute(
      "AcreMultiAssetVault",
      {
        from: governance,
        log: true,
        waitConfirmations: waitConfirmationsNumber(hre),
      },
      "acceptOwnership",
    )
  }
}

export default func

func.tags = ["TransferOwnershipAcreMultiAssetVault"]
func.dependencies = ["AcreMultiAssetVault"]
// TODO: Uncomment after contracts are deployed to mainnet.
// func.skip = async (hre: HardhatRuntimeEnvironment): Promise<boolean> =>
//   Promise.resolve(hre.network.name === "integration")
