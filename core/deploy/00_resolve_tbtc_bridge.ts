import type { DeployFunction } from "hardhat-deploy/types"
import type {
  HardhatNetworkConfig,
  HardhatRuntimeEnvironment,
} from "hardhat/types"
import { isNonZeroAddress } from "../helpers/address"
import { waitConfirmationsNumber } from "../helpers/deployment"

const func: DeployFunction = async (hre: HardhatRuntimeEnvironment) => {
  const { getNamedAccounts, deployments } = hre
  const { log } = deployments
  const { deployer } = await getNamedAccounts()

  const bridge = await deployments.getOrNull("Bridge")

  if (bridge && isNonZeroAddress(bridge.address)) {
    log(`using Bridge contract at ${bridge.address}`)
  } else if ((hre.network.config as HardhatNetworkConfig)?.forking?.enabled) {
    throw new Error("deployed Bridge contract not found")
  } else {
    log("deploying Bridge contract stub")

    await deployments.deploy("Bridge", {
      contract: "BridgeStub",
      args: [],
      from: deployer,
      log: true,
      waitConfirmations: waitConfirmationsNumber(hre),
    })
  }
}

export default func

func.tags = ["TBTC", "Bridge"]
