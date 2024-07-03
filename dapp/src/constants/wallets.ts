type WalletInfo = {
  downloadUrls: {
    desktop: string
  }
}

const UNISAT: WalletInfo = {
  downloadUrls: {
    desktop:
      "https://chromewebstore.google.com/detail/unisat-wallet/ppbibelpcjmhbdihakflkdcoccbgbkpo",
  },
}

const OKX: WalletInfo = {
  downloadUrls: {
    desktop:
      "https://chromewebstore.google.com/detail/okx-wallet/mcohilncbfahbmgdjkbpemcciiolgcge",
  },
}

export default {
  UNISAT,
  OKX,
}
