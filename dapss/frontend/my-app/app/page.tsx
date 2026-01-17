"use client";

import { useState, useEffect } from "react";
import {
  useAccount,
  useConnect,
  useDisconnect,
  useReadContract,
  useWriteContract,
  useBalance,
} from "wagmi";
import { injected } from "wagmi/connectors";
import { formatEther } from "ethers";
import DitherCanvas from "./components/DitherCanvas";

//  CONFIG

const CONTRACT_ADDRESS = "0x0CA1356aaa245E2D863c5c980Bc6fbadF7AA42A1";
const AVALANCHE_FUJI_CHAIN_ID = 43113;

const SIMPLE_STORAGE_ABI = [
  {
    inputs: [],
    name: "getValue",
    outputs: [{ type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ name: "_value", type: "uint256" }],
    name: "setValue",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
] as const;

export default function Page() {
  //  WALLET STATE
  const { address, isConnected, chainId: currentChainId } = useAccount();
  const { connect, isPending: isConnecting } = useConnect();
  const { disconnect } = useDisconnect();
  const { data: balanceData } = useBalance({ address });
  const [mounted, setMounted] = useState(false);

  // CONTRACT STATE

  const [inputValue, setInputValue] = useState("");

  const { data: contractValue, refetch: refetchValue } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: SIMPLE_STORAGE_ABI,
    functionName: "getValue",
  });

  const { writeContract, isPending: isTxPending } = useWriteContract();

  useEffect(() => {
    setMounted(true);
  }, []);

  // HANDLERS
  const handleConnect = () => {
    connect({ connector: injected() });
  };

  const handleUpdateValue = () => {
    if (!inputValue) return;
    try {
      writeContract(
        {
          address: CONTRACT_ADDRESS,
          abi: SIMPLE_STORAGE_ABI,
          functionName: "setValue",
          args: [BigInt(inputValue)],
        },
        {
          onSuccess: () => {
            setInputValue("");
            setTimeout(() => {
              refetchValue();
            }, 3000); 
          },
        }
      );
    } catch (error) {
      console.error("Transaction failed:", error);
    }
  };

  const shortenAddress = (addr: string | undefined) => {
    if (!addr) return "-";
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  const isFuji = currentChainId === AVALANCHE_FUJI_CHAIN_ID;
  const networkName =
    currentChainId === AVALANCHE_FUJI_CHAIN_ID
      ? "Avalanche Fuji Testnet"
      : currentChainId
      ? `Chain ID: ${currentChainId}`
      : "-";
  
  const statusColor = isConnected && isFuji ? "#4cd137" : (isConnected ? "#fbc531" : "#00ff00");
  const statusText = isConnected ? (isFuji ? "Connected" : "Wrong Network") : "Not Connected";

  if (!mounted) return null;

  return (
    <>
      <div id="canvas-container">
        <DitherCanvas />
      </div>

      <div className="container">
        {/*  MAIN GLASS PANEL */}
        <div className="glass-panel" style={{ 
            width: '100%', 
            maxWidth: '600px',
            padding: '2.5rem',
            background: 'rgba(10, 20, 10, 0.55)', 
            backdropFilter: 'blur(16px)', 
            border: '1px solid rgba(20, 255, 80, 0.1)', 
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)',
            borderRadius: '24px', 
            display: 'flex',
            flexDirection: 'column',
            gap: '1.5rem'
        }}>
            
            <div style={{ textAlign: 'center' }}>
                <h1 style={{ marginBottom: '8px' }}>Avalanche dApp</h1>
                <p className="subtitle" style={{ margin: 0 }}>Connect Wallet (Core Wallet)</p>
            </div>

            {/* Button */}
            <div style={{ textAlign: 'center' }}>
                {isConnected ? (
                <button
                    id="connectBtn"
                    onClick={() => disconnect()}
                    style={{ opacity: 0.8, cursor: "pointer", width: '100%' }}
                >
                    Disconnect
                </button>
                ) : (
                <button
                    id="connectBtn"
                    onClick={handleConnect}
                    disabled={isConnecting}
                    style={{ width: '100%' }}
                >
                    {isConnecting ? "Connecting..." : "Connect Wallet"}
                </button>
                )}
            </div>

            {/* Wallet Info */}
            <div className="card" style={{ border: 'none', padding: 0, margin: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                    <p><strong>Status:</strong></p>
                    <span id="status" style={{ color: statusColor }}>{statusText}</span>
                </div>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                    <p><strong>Network:</strong></p>
                    <span id="network">{networkName}</span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                     <p><strong>Address:</strong></p>
                     <p id="address" title={address} style={{ color: '#bd93f9' }}>
                        {shortenAddress(address)}
                    </p>
                </div>

                <div style={{ textAlign: 'center', marginTop: '1rem', padding: '1rem', background: 'rgba(0,0,0,0.3)', borderRadius: '12px' }}>
                    <p style={{ fontSize: '0.8rem', opacity: 0.7, marginBottom: '5px' }}>YOUR BALANCE</p>
                    <span id="balance" style={{ fontSize: '2.5rem', fontWeight: 'bold' }}>
                        {balanceData ? parseFloat(formatEther(balanceData.value)).toFixed(4) : "0.0000"}
                    </span> 
                    <span style={{ marginLeft: '8px', fontSize: '1rem', color: 'var(--color-primary)' }}>AVAX</span>
                </div>
            </div>

            {/* Contract Module */}
            {isConnected && isFuji && (
            <div className="contract-section" style={{ 
                marginTop: '1rem', 
                padding: '1.5rem', 
                background: 'rgba(20, 255, 80, 0.05)', 
                borderRadius: '16px',
                border: '1px solid rgba(20, 255, 80, 0.1)'
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <p className="subtitle" style={{ margin: 0, textAlign: 'left' }}>Simple Storage</p>
                    <p style={{ margin: 0 }}>
                        <span style={{ opacity: 0.7, fontSize: '0.8rem', marginRight: '8px' }}>VALUE:</span>
                        <span style={{ color: "var(--color-primary)", fontWeight: 'bold', fontSize: '1.2rem' }}>
                            {contractValue?.toString() || "0"}
                        </span>
                    </p>
                </div>

                <div className="input-group" style={{ display: 'flex', gap: '10px' }}>
                    <input 
                        type="text" 
                        placeholder="Enter value..." 
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        style={{ flex: 1, padding: '12px', background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff' }}
                    />
                    <button 
                        className="action-btn" 
                        style={{ margin: 0, padding: '0 24px', width: 'auto', borderRadius: '8px' }}
                        onClick={handleUpdateValue}
                        disabled={isTxPending || !inputValue}
                    >
                        {isTxPending ? "Wait..." : "Set"}
                    </button>
                </div>
            </div>
            )}

            <div className="card2" style={{ marginTop: '0', opacity: 0.5 }}>
                <p><strong>Dicky Baskara Hidayat | 241011402329</strong></p>
            </div>
        </div>
      </div>
    </>
  );
}
