import { BitcoinNetwork, Hex } from "../../../src"

// eslint-disable-next-line import/prefer-default-export
export const btcAddresses: {
  type: string
  network: BitcoinNetwork
  address: string
  scriptPubKey: Hex
}[] = [
  // Testnet addresses.
  {
    type: "P2PKH",
    network: BitcoinNetwork.Testnet,
    address: "mjc2zGWypwpNyDi4ZxGbBNnUA84bfgiwYc",
    scriptPubKey: Hex.from(
      "76a9142cd680318747b720d67bf4246eb7403b476adb3488ac",
    ),
  },
  {
    type: "P2WPKH",
    network: BitcoinNetwork.Testnet,
    address: "tb1qumuaw3exkxdhtut0u85latkqfz4ylgwstkdzsx",
    scriptPubKey: Hex.from("0014e6f9d74726b19b75f16fe1e9feaec048aa4fa1d0"),
  },
  {
    type: "P2SH",
    network: BitcoinNetwork.Testnet,
    address: "2MsM67NLa71fHvTUBqNENW15P68nHB2vVXb",
    scriptPubKey: Hex.from("a914011beb6fb8499e075a57027fb0a58384f2d3f78487"),
  },
  {
    type: "P2WSH",
    network: BitcoinNetwork.Testnet,
    address: "tb1qau95mxzh2249aa3y8exx76ltc2sq0e7kw8hj04936rdcmnynhswqqz02vv",
    scriptPubKey: Hex.from(
      "0020ef0b4d985752aa5ef6243e4c6f6bebc2a007e7d671ef27d4b1d0db8dcc93bc1c",
    ),
  },
  {
    type: "P2PKH",
    network: BitcoinNetwork.Mainnet,
    address: "12higDjoCCNXSA95xZMWUdPvXNmkAduhWv",
    scriptPubKey: Hex.from(
      "76a91412ab8dc588ca9d5787dde7eb29569da63c3a238c88ac",
    ),
  },
  // Mainnet addresses.
  {
    type: "P2WPKH",
    network: BitcoinNetwork.Mainnet,
    address: "bc1q34aq5drpuwy3wgl9lhup9892qp6svr8ldzyy7c",
    scriptPubKey: Hex.from("00148d7a0a3461e3891723e5fdf8129caa0075060cff"),
  },
  {
    type: "P2SH",
    network: BitcoinNetwork.Mainnet,
    address: "342ftSRCvFHfCeFFBuz4xwbeqnDw6BGUey",
    scriptPubKey: Hex.from("a91419a7d869032368fd1f1e26e5e73a4ad0e474960e87"),
  },
  {
    type: "P2WSH",
    network: BitcoinNetwork.Mainnet,
    address: "bc1qeklep85ntjz4605drds6aww9u0qr46qzrv5xswd35uhjuj8ahfcqgf6hak",
    scriptPubKey: Hex.from(
      "0020cdbf909e935c855d3e8d1b61aeb9c5e3c03ae8021b286839b1a72f2e48fdba70",
    ),
  },
]
