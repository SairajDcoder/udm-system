"use client"

import { wagmiAdapter, projectId, networks } from "@/lib/web3/config"
import { createAppKit } from "@reown/appkit/react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { type ReactNode, useState } from "react"
import { WagmiProvider, type Config } from "wagmi"
import { cookieToInitialState } from "wagmi"

createAppKit({
  adapters: [wagmiAdapter],
  projectId,
  networks,
  defaultNetwork: networks[0],
  metadata: {
    name: "UniChain",
    description: "Secure Academic Credentials on Blockchain",
    url: "https://unichain.mitaoe.ac.in",
    icons: ["/icon.svg"],
  },
  features: {
    analytics: true,
    email: false,
    socials: [],
  },
  themeMode: "light",
  themeVariables: {
    "--w3m-accent": "#0E8A7E",
    "--w3m-border-radius-master": "8px",
  },
})

export function Web3Provider({
  children,
  cookies,
}: {
  children: ReactNode
  cookies: string | null
}) {
  const initialState = cookieToInitialState(
    wagmiAdapter.wagmiConfig as Config,
    cookies
  )

  const [queryClient] = useState(() => new QueryClient())

  return (
    <WagmiProvider
      config={wagmiAdapter.wagmiConfig as Config}
      initialState={initialState}
    >
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </WagmiProvider>
  )
}
