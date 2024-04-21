import { ApolloClient, ApolloProvider, InMemoryCache } from "@apollo/client"
import React from "react"

const client = new ApolloClient({
  uri: import.meta.env.VITE_APOLLO_CLIENT_URI,
  cache: new InMemoryCache(),
})

export function ApolloClientProvider({
  children,
}: {
  children: React.ReactElement
}): JSX.Element {
  return <ApolloProvider client={client}>{children}</ApolloProvider>
}
