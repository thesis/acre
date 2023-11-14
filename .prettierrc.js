module.exports = {
  ...require("@thesis-co/prettier-config"),
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
