import { OrangeKitSdk } from "@orangekit/sdk"
import { EthereumAddress } from "../ethereum"
import { BitcoinProvider } from "../bitcoin"
import { ChainIdentifier } from "../contracts"

type AcreUserIdentifier = ChainIdentifier

type BitcoinAddress = string

type AcreIdentifierCache = Map<BitcoinAddress, AcreUserIdentifier>

const cache: AcreIdentifierCache = new Map()

async function toAcreIdentifier(
  bitcoinProvider: BitcoinProvider,
  orangeKit: OrangeKitSdk,
): Promise<AcreUserIdentifier> {
  const bitcoinAddress = await bitcoinProvider.getAddress()

  const cachedIdentifier = cache.get(bitcoinAddress)

  if (cachedIdentifier) {
    return cachedIdentifier
  }

  const identifier = EthereumAddress.from(
    await orangeKit.predictAddress(bitcoinAddress),
  )

  cache.set(bitcoinAddress, identifier)

  return identifier
}

const AcreIdentifierResolver = {
  toAcreIdentifier,
}

export default AcreIdentifierResolver
