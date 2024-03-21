import type { DeployFunction } from "hardhat-deploy/types"
import type {
  HardhatNetworkConfig,
  HardhatRuntimeEnvironment,
} from "hardhat/types"
import { isNonZeroAddress } from "../helpers/address"

const func: DeployFunction = async (hre: HardhatRuntimeEnvironment) => {
  const { deployments } = hre
  const { log } = deployments

  const mezoPortal = await deployments.getOrNull("MezoPortal")

  if (mezoPortal && isNonZeroAddress(mezoPortal.address)) {
    log(`using MezoPortal contract at ${mezoPortal.address}`)
  } else if ((hre.network.config as HardhatNetworkConfig)?.forking?.enabled) {
    throw new Error("deployed MezoPortal contract not found")
  }
}

export default func

func.tags = ["MezoPortal"]
