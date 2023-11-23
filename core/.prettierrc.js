module.exports = {
  ...require("../.prettierrc.js"),
  plugins: ["prettier-plugin-solidity"],
  overrides: [
    {
      files: "*.sol",
      options: {
        tabWidth: 4,
      },
    },
  ],
}
