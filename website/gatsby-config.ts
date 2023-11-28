import type { GatsbyConfig } from "gatsby"

const config: GatsbyConfig = {
  siteMetadata: {
    // TODO: Update the needed data when the final domain name will be ready.
    siteUrl: "https://www.yourdomain.tld",
    title: "Acre",
  },
  graphqlTypegen: true,
  plugins: ["gatsby-plugin-pnpm"],
}

export default config
