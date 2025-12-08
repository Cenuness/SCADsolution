import { configureChains, createConfig } from "wagmi";
import { jsonRpcProvider } from "wagmi/providers/jsonRpc";

// RPC oficial da CESS Testnet
const RPC_ENDPOINT = "https://testnet-rpc.cess.network";

// Definição da chain da CESS Testnet
export const cessTestnet = {
  id: 11330,
  name: "CESS Testnet",
  network: "cess-testnet",
  nativeCurrency: {
    decimals: 18,
    name: "CESS Token",
    symbol: "TCESS",
  },
  rpcs: {
    public: { http: [RPC_ENDPOINT] },
    default: { http: [RPC_ENDPOINT] },
  },
};

// Configuração Wagmi
const { publicClient, webSocketPublicClient } = configureChains(
  [cessTestnet],
  [
    jsonRpcProvider({
      rpc: () => ({ http: RPC_ENDPOINT }),
    }),
  ]
);

export const wagmiConfig = createConfig({
  publicClient,
  webSocketPublicClient,
});