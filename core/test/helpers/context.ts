import { deployments } from "hardhat"
import { getDeployedContract } from "./contract"
import { getUnnamedSigner } from "./signer"

import type {
  StBTC as stBTC,
  Dispatcher,
  TestERC20,
  TestERC4626,
  SingleTokenVault,
  Allocator,
} from "../../typechain"

// eslint-disable-next-line import/prefer-default-export
export async function deployment() {
  await deployments.fixture()

  const isIntegrationTest = process.env.INTEGRATION_TEST as string

  let tbtc: TestERC20
  if (isIntegrationTest === "true") {
    const tbtcArifact = await deployments.getArtifact("TBTC")
    const [defaultSigner] = await getUnnamedSigner()
    tbtc = new ethers.Contract(
      tbtcArifact.address,
      tbtcArifact.abi,
      defaultSigner,
    ) as TestERC20
  } else {
    tbtc = await getDeployedContract("TBTC")
  }
  const stbtc: stBTC = await getDeployedContract("stBTC")
  const dispatcher: Dispatcher = await getDeployedContract("Dispatcher")
  const vault: TestERC4626 = await getDeployedContract("Vault")
  const singleTokenVault: SingleTokenVault =
    await getDeployedContract("SingleTokenVault")
  const allocator: Allocator = await getDeployedContract("Allocator")
  const reserve: Reserve = await getDeployedContract("Reserve")

  return {
    tbtc,
    stbtc,
    dispatcher,
    vault,
    singleTokenVault,
    allocator,
    reserve,
  }
}
