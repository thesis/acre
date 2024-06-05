import { PARTNERS, Partner } from "#/types"

export function isOfTypePartners(keyInput: string): keyInput is Partner {
  const partners = Object.values(PARTNERS) as string[]
  return partners.includes(keyInput)
}
