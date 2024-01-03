import type { HardhatRuntimeEnvironment } from "hardhat/types"
import type { DeployFunction } from "hardhat-deploy/types"

const func: DeployFunction = async (hre: HardhatRuntimeEnvironment) => {
  const { getNamedAccounts, deployments } = hre
  const { deployer, governance } = await getNamedAccounts()
  // eslint-disable-next-line @typescript-eslint/unbound-method
  const { log } = deployments

  log(`transferring ownership of Acre contract to ${governance}`)

  await deployments.execute(
    "Acre",
    { from: deployer, log: true, waitConfirmations: 1 },
    "transferOwnership",
    governance,
  )
}

export default func

func.tags = ["TransferOwnershipAcre"]
