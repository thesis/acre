import { OrangeKitSdk } from "@orangekit/sdk"
import { EthereumAddress } from "../ethereum"
import { BitcoinProvider } from "../bitcoin"
import { ChainIdentifier } from "../contracts"

export type AcreAccountIdentifier = ChainIdentifier

type BitcoinAddress = string

type AcreIdentifierCache = Map<BitcoinAddress, AcreAccountIdentifier>

const cache: AcreIdentifierCache = new Map<
  BitcoinAddress,
  AcreAccountIdentifier
>()

async function toAcreIdentifier(
  bitcoinProvider: BitcoinProvider,
  orangeKit: OrangeKitSdk,
): Promise<{
  identifier: AcreAccountIdentifier
  associatedBitcoinAddress: BitcoinAddress
}> {
  const bitcoinAddress = await bitcoinProvider.getAddress()

  const cachedIdentifier = cache.get(bitcoinAddress)

  if (cachedIdentifier) {
    return {
      identifier: cachedIdentifier,
      associatedBitcoinAddress: bitcoinAddress,
    }
  }

  const identifier = EthereumAddress.from(
    await orangeKit.predictAddress(bitcoinAddress),
  )

  cache.set(bitcoinAddress, identifier)

  return { identifier, associatedBitcoinAddress: bitcoinAddress }
}

const AcreIdentifierResolver = {
  toAcreIdentifier,
}

export default AcreIdentifierResolver
