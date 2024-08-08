import React, { useState, useEffect } from 'react';
import { PhantomWalletAdapter } from '@solana/wallet-adapter-wallets';
import { clusterApiUrl, Connection } from '@solana/web3.js';
import { WalletProvider, useWallet } from '@solana/wallet-adapter-react';
import { WalletModalProvider, WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import '@solana/wallet-adapter-react-ui/styles.css';

const CustomWalletConnection = ({ children }) => {
  const network = 'mainnet-beta';
  const endpoint = clusterApiUrl(network);
  const [wallets, setWallets] = useState([]);
  const [connection, setConnection] = useState(null);

  useEffect(() => {
    // Initialize wallets
    setWallets([
      new PhantomWalletAdapter(),
      // Add other wallets if needed
    ]);
  }, []);

  useEffect(() => {
    // Initialize the connection
    const connectionInstance = new Connection(endpoint, 'confirmed');
    setConnection(connectionInstance);
  }, [endpoint]);

  // Example function to check wallet connection status
  const TestConnection = () => {
    const { connected, publicKey } = useWallet();

    useEffect(() => {
      if (connected) {
        console.log('Wallet connected:', publicKey.toBase58());
      } else {
        console.log('Wallet not connected');
      }
    }, [connected, publicKey]);

    return <div>{connected ? `Connected: ${publicKey.toBase58()}` : 'Not connected'}</div>;
  };

  return (
    <WalletProvider wallets={wallets} autoConnect>
      <WalletModalProvider>
        {/* <WalletMultiButton /> */}
        {/* <TestConnection /> */}
        {children}
      </WalletModalProvider>
    </WalletProvider>
  );
};

export default CustomWalletConnection;
