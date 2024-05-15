import type { JestConfigWithTsJest } from "ts-jest"

const jestConfig: JestConfigWithTsJest = {
  preset: "ts-jest",
  testPathIgnorePatterns: ["<rootDir>/dist/", "<rootDir>/node_modules/"],
}

export default jestConfig
