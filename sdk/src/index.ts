export type AcreConfig = {
  chainId: number
}

class Acre {
  #config: AcreConfig

  constructor(_config: AcreConfig) {
    this.#config = _config
  }
}

export default Acre
