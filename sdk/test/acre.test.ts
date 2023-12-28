import { expect } from "chai"

import Acre from "../src"

describe("Acre SDK", () => {
  it("should create SDK correctly", () => {
    const sdk = new Acre({ chainId: 1 })

    expect(sdk).to.be.instanceof(Acre)
  })
})
