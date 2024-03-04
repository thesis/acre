import { backoffRetrier } from "@keep-network/tbtc-v2.ts"

type BackoffRetrierParameters = Parameters<typeof backoffRetrier>

export { backoffRetrier, BackoffRetrierParameters }
