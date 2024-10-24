import { helpers } from "hardhat"

import { deployment } from "../helpers"

export async function integrationTestFixture() {
  const contracts = await deployment()

  const { deployer } = await helpers.signers.getNamedSigners()

  // Impersonate accounts.
  const governance = await helpers.account.impersonateAccount(
    expectedMainnetAddresses.governance,
    {
      from: deployer,
      value: 10n,
    },
  )

  const maintainer = await helpers.account.impersonateAccount(
    expectedMainnetAddresses.maintainer,
    {
      from: deployer,
      value: 10n,
    },
  )

  // Upgrade contracts to the latest development version.
  ;[contracts.stbtc] = await helpers.upgrades.upgradeProxy("stBTC", "stBTC", {
    factoryOpts: { signer: governance },
  })
  ;[contracts.mezoAllocator] = await helpers.upgrades.upgradeProxy(
    "MezoAllocator",
    "MezoAllocator",
    {
      factoryOpts: { signer: governance },
    },
  )

  return {
    governance,
    maintainer,
    ...contracts,
  }
}

export const expectedMainnetAddresses = {
  // Signers
  treasury: "0xb0d97781D70A8ebD0cd8bFbE79AbC5545B829fc5",
  governance: "0x790Dda4c56b3c45d0e4514eDbAaBa30D7129c857",
  pauseAdmin: "0x1299C7432034d1B85e148a2033d571a9B578292B",
  maintainer: "0x373C177845cEfaB4Ed85666b99c9fDB40ae7Cd19",

  // Acre Contracts
  stbtc: "0xdF217EFD8f3ecb5E837aedF203C28c1f06854017",
  mezoAllocator: "0xb90fdAd3DFD180458D62Cc6acedc983D78E20122",
  bitcoinDepositor: "0x2Ba614a598Cffa5a19d683cDCA97bac3a49313d1",
  bitcoinRedeemer: "0x7e184B0cC12572D12Db6dA248322A0e3618fc756",
  multiAssetVault: "0xB33D938616C328eda0370CDBdb4b02dD78E2cb19",

  // External Contracts
  mezoPortal: "0xAB13B8eecf5AA2460841d75da5d5D861fD5B8A39",
  tbtc: "0x18084fbA666a33d37592fA2633fD49a74DD93a88",
  bridge: "0x5e4861a80B55f035D899f66772117F00FA0E8e7B",
  tbtcVault: "0x9C070027cdC9dc8F82416B2e5314E11DFb4FE3CD",

  // Assets
  solvBtc: "0x7A56E1C57C7475CCf742a1832B028F0456652F97",
  solvBtcBbn: "0xd9D920AA40f578ab794426F5C90F6C731D159DEf",
}
