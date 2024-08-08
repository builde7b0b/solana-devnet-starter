import React, { useEffect, useState } from 'react';
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletModalProvider, WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { PhantomWalletAdapter, SolletWalletAdapter } from '@solana/wallet-adapter-wallets';
import { clusterApiUrl, Connection } from '@solana/web3.js';
import '@solana/wallet-adapter-react-ui/styles.css'; // Default styles for wallet adapter UI

const WalletConnection = ({ children }) => {
  // Specify the network you are connecting to
  const network = 'mainnet-beta';
  const [endpoint, setEndpoint] = useState(clusterApiUrl(network));
  const [wallets, setWallets] = useState([]);

  useEffect(() => {
    // Function to configure and set wallets
    const configureWallets = () => {
      setWallets([
        new PhantomWalletAdapter(),
      ]);
    };

    configureWallets();
  }, [network]);

  // You can optionally manage the connection state if needed
  const [connection, setConnection] = useState(null);

  useEffect(() => {
    // Initialize the connection
    const connectionInstance = new Connection(endpoint, 'confirmed');
    setConnection(connectionInstance);

    // Cleanup function if necessary (e.g., disconnecting or resetting state)
    return () => {
      setConnection(null);
    };
  }, [endpoint]);

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          {/* <WalletMultiButton /> */}
          {children}
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
};

export default WalletConnection;
