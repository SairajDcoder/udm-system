import { cookieStorage, createStorage } from "wagmi"
import { WagmiAdapter } from "@reown/appkit-adapter-wagmi"
import { mainnet, sepolia } from "@reown/appkit/networks"

export const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID!

if (!projectId) {
  throw new Error("NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID is not set")
}

export const networks = [mainnet, sepolia] as [typeof mainnet, typeof sepolia]

export const wagmiAdapter = new WagmiAdapter({
  storage: createStorage({
    storage: cookieStorage,
  }),
  ssr: true,
  projectId,
  networks,
})

export const wagmiConfig = wagmiAdapter.wagmiConfig
