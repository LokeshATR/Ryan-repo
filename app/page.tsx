"use client";

import {
  DynamicContextProvider,
  DynamicWidget,
  useDynamicContext,
} from "@dynamic-labs/sdk-react-core";
import { EthereumWalletConnectors } from "@dynamic-labs/ethereum";
import { EthersExtension } from "@dynamic-labs/ethers-v6";
import {
  WagmiProvider,
  createConfig,
  http,
  useSendTransaction,
  useTransaction,
  useWriteContract,
} from "wagmi";
import { mainnet, polygon, polygonMumbai } from "wagmi/chains";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { DynamicWagmiConnector } from "@dynamic-labs/wagmi-connector";
import { useEffect, useMemo, useState } from "react";
import type { Account, Chain, Client, Transport, WalletClient } from "viem";
import { type Config, useConnectorClient } from "wagmi";


const config = createConfig({
  chains: [mainnet, polygon, polygonMumbai],
  multiInjectedProviderDiscovery: false,
  transports: {
    [mainnet.id]: http(),
    [polygon.id]: http(),
    [polygonMumbai.id]: http(),
  },
});

const queryClient = new QueryClient();

export default function Home() {
  return (
    <DynamicContextProvider
      settings={{
        environmentId: "f0824038-9800-4848-9809-657211b26b75",
        walletConnectors: [EthereumWalletConnectors],
      }}
    >
        <WagmiProvider config={config}>
        <QueryClientProvider client={queryClient}></QueryClientProvider>
        <QueryClientProvider client={queryClient}>
        <DynamicWagmiConnector>
            <DynamicWidget />
            <ContractWriteSection />
            <WagmiSignerSection />
            <Testing/>
      </DynamicWagmiConnector>
      </QueryClientProvider>
      </WagmiProvider>
    </DynamicContextProvider>
  );
}

function ContractWriteSection() {
  const { writeContract, data, isPending } = useWriteContract();

  const { isSuccess } = useTransaction({
    hash: data,
  });

  return (
    <div>
      <button
        disabled={!writeContract || isPending}
        onClick={() =>
          writeContract?.({
            abi: [
              {
                inputs: [],
                name: "mint",
                outputs: [],
                stateMutability: "nonpayable",
                type: "function",
              },
            ] as const,
            address: "0xFBA3912Ca04dd458c843e2EE08967fC04f3579c2",
            functionName: "mint",
          })
        }
      >
        {isPending ? "Minting..." : "Mint Free NFT"}
      </button>
      {isSuccess && (
        <div>
          <p>Successfully minted your NFT!</p>
          <p>Transaction hash: {data}</p>
        </div>
      )}
    </div>
  );
}

function Testing() {
  const { writeContract, data, isPending } = useWriteContract();



  const { isSuccess } = useTransaction({
    hash: data,
  });

  const myabi=[{"inputs":[],"name":"get","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"string","name":"x","type":"string"}],"name":"set","outputs":[],"stateMutability":"nonpayable","type":"function"}]
  return (
    <div>
      <button
        disabled={!writeContract || isPending}
        onClick={() =>
          writeContract?.({
            abi: myabi,
            address: "0x5eA30Ff662Af510B03b83C66f7788853813769DA",
            functionName: "set",
          args:["77"]
          })
        }
      >
        {isPending ? "Minting..." : "my contract hit"}
      </button>
      {isSuccess && (
        <div>
          <p>Successfully minted your NFT!</p>
          <p>Transaction hash: {data}</p>
        </div>
      )}
    </div>
  );
}

function WagmiSignerSection() {
  const {primaryWallet} = useDynamicContext();
  const { data: hashResponse, sendTransaction } = useSendTransaction()
  const [hash, setHash] = useState<`0x${string}` | undefined>(undefined);

  const handleClick = async () => {
    console.log('click', primaryWallet)
    if (!primaryWallet) return;
    const deepLink = primaryWallet.connector.getDeepLink();

    if (deepLink) {
      window.location.href = deepLink;
    }
    const tx = sendTransaction({
      to: "0xfcDbCC445768cB910A4E3b79cB70b763613ADd43",
      data: "0x60fe47b10000000000000000000000000000000000000000000000000000000000000002",
    });
    setHash(hashResponse);
  };

  return (
    <div>
      <button disabled={!primaryWallet} onClick={handleClick}>
        {"Mint Using Wagmi"}
      </button>
      {hash && (
        <div>
          <p>Successfully minted your NFT!</p>
          <p>Transaction hash: {hash}</p>
        </div>
      )}
    </div>
  );
}
