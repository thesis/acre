import type { GatsbyConfig } from "gatsby"

const config: GatsbyConfig = {
  siteMetadata: {
    siteUrl: "https://acre.fi/",
    title: "Acre",
  },
  graphqlTypegen: true,
  plugins: [
    "gatsby-plugin-pnpm",
    {
      resolve: "gatsby-plugin-manifest",
      options: {
        name: "Acre",
        short_name: "Acre",
        start_url: "/",
        background_color: "#F3E5C1",
        theme_color: "#F3E5C1",
        display: "standalone",
        icon: "src/images/favicon.png",
        crossOrigin: "use-credentials",
      },
    },
  ],
}

export default config
