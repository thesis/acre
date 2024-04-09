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

  const tbtc = await deployments.getOrNull("TBTC")

  if (tbtc && isNonZeroAddress(tbtc.address)) {
    log(`using TBTC contract at ${tbtc.address}`)
  } else if (
    !hre.network.tags.allowStubs ||
    (hre.network.config as HardhatNetworkConfig)?.forking?.enabled
  ) {
    throw new Error("deployed TBTC contract not found")
  } else {
    log("deploying TBTC contract stub")

    await deployments.deploy("TBTC", {
      contract: "TestTBTC",
      args: ["Test tBTC", "TestTBTC"],
      from: deployer,
      log: true,
      waitConfirmations: waitConfirmationsNumber(hre),
    })
  }
}

export default func

func.tags = ["TBTC", "TBTCToken"]
