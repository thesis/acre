import { EthereumAddress } from "../../../src"

// eslint-disable-next-line import/prefer-default-export
export const extraDataValidTestData: {
  testDescription: string
  staker: EthereumAddress
  referral: number
  extraData: string
}[] = [
  {
    testDescription: "receiver has leading zeros",
    staker: EthereumAddress.from("0x000055d85E80A49B5930C4a77975d44f012D86C1"),
    referral: 6851, // hex: 0x1ac3
    extraData:
      "0x000055d85e80a49b5930c4a77975d44f012d86c11ac300000000000000000000",
  },
  {
    testDescription: "receiver has trailing zeros",
    staker: EthereumAddress.from("0x2d2F8BC7923F7F806Dc9bb2e17F950b42CfE0000"),
    referral: 6851, // hex: 0x1ac3
    extraData:
      "0x2d2f8bc7923f7f806dc9bb2e17f950b42cfe00001ac300000000000000000000",
  },
  {
    testDescription: "referral is zero",
    staker: EthereumAddress.from("0xeb098d6cDE6A202981316b24B19e64D82721e89E"),
    referral: 0,
    extraData:
      "0xeb098d6cde6a202981316b24b19e64d82721e89e000000000000000000000000",
  },
  {
    testDescription: "referral has leading zeros",
    staker: EthereumAddress.from("0xeb098d6cDE6A202981316b24B19e64D82721e89E"),
    referral: 31, // hex: 0x001f
    extraData:
      "0xeb098d6cde6a202981316b24b19e64d82721e89e001f00000000000000000000",
  },
  {
    testDescription: "referral has trailing zeros",
    staker: EthereumAddress.from("0xeb098d6cDE6A202981316b24B19e64D82721e89E"),
    referral: 19712, // hex: 0x4d00
    extraData:
      "0xeb098d6cde6a202981316b24b19e64d82721e89e4d0000000000000000000000",
  },
  {
    testDescription: "referral is maximum value",
    staker: EthereumAddress.from("0xeb098d6cDE6A202981316b24B19e64D82721e89E"),
    referral: 65535, // max uint16
    extraData:
      "0xeb098d6cde6a202981316b24b19e64d82721e89effff00000000000000000000",
  },
]
