import { createConfig, http } from "wagmi";
import { injected } from "wagmi/connectors";
import { arcMainnet, arcTestnet } from "./chains";

export const wagmiConfig = createConfig({
  chains: [arcMainnet, arcTestnet],
  connectors: [injected()],
  transports: {
    [arcMainnet.id]: http(),
    [arcTestnet.id]: http(),
  },
  ssr: true,
});
