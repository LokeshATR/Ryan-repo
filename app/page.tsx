"use client";

import {
  DynamicContextProvider,
  DynamicWidget,
} from "@dynamic-labs/sdk-react-core";
import { EthereumWalletConnectors } from "@dynamic-labs/ethereum";
import { EthersExtension } from "@dynamic-labs/ethers-v6";
import {
  WagmiProvider,
  createConfig,
  http,
  useTransaction,
  useWriteContract,
} from "wagmi";
import { mainnet, polygon, polygonMumbai } from "wagmi/chains";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { DynamicWagmiConnector } from "@dynamic-labs/wagmi-connector";
import { BrowserProvider, JsonRpcSigner, ethers } from "ethers";
import { useEffect, useMemo, useState } from "react";
import type { Account, Chain, Client, Transport } from "viem";
import { type Config, useConnectorClient } from "wagmi";
import { Contract } from "ethers";

function clientToSigner(client: Client<Transport, Chain, Account>) {
  const { account, chain, transport } = client;
  const network = {
    chainId: chain.id,
    name: chain.name,
    ensAddress: chain.contracts?.ensRegistry?.address,
  };
  const provider = new BrowserProvider(transport, network);
  const abi=[
    {
        "inputs": [],
        "name": "get",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "x",
                "type": "uint256"
            }
        ],
        "name": "set",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    }
  ]
  
  const signer = new JsonRpcSigner(provider, account.address);
  const instance = new Contract("0xfcDbCC445768cB910A4E3b79cB70b763613ADd43", abi, signer)
  console.log("ss",instance?.interface?.encodeFunctionData("set",["0x02"]));
  const interfacee = new ethers.Interface(abi)
  const resultData:any = "0x0000000000000000000000000000000000000000000000000de0b6b3a7640000";

  // const data = instance.interface?.encodeFunctionData("set",resultData)

  //console.log("ins",instance?.interface?.decodeFunctionData("get",""));
  
  return signer;
}

/** Hook to convert a viem Wallet Client to an ethers.js Signer. */
function useEthersSigner({ chainId }: { chainId?: number } = {}) {
  const { data: client } = useConnectorClient<Config>({ chainId });
  return useMemo(() => (client ? clientToSigner(client) : undefined), [client]);
}

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
        environmentId: "8147e03d-fea6-4336-afb6-3eb7df92c7df",
        walletConnectorExtensions: [EthersExtension],
        walletConnectors: [EthereumWalletConnectors],
      }}
    >
      <WagmiProvider config={config}>
        <QueryClientProvider client={queryClient}>
          <DynamicWagmiConnector>
            <DynamicWidget />
            <ContractWriteSection />
            <EthersSignerSection />
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

function EthersSignerSection() {
  const signer = useEthersSigner();
  const [hash, setHash] = useState<string | null>(null);


  const handleClick = async () => {
    if (!signer) return;
    const tx = await signer.sendTransaction({
      to: "0xfcDbCC445768cB910A4E3b79cB70b763613ADd43",
      data: "0x60fe47b10000000000000000000000000000000000000000000000000000000000000002",
    });
    setHash(tx.hash);
  };

  return (
    <div>
      <button disabled={!signer} onClick={handleClick}>
        {"Mint Using Ethers Signer"}
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
