export interface BitcoinProvider {
  getAddress(): Promise<string>
}
