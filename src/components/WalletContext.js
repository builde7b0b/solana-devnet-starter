// WalletContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { Connection, clusterApiUrl } from '@solana/web3.js';

const WalletContext = createContext(null);

export const useWalletContext = () => useContext(WalletContext);

export const WalletContextProvider = ({ children }) => {
  const { connected, publicKey } = useWallet();
  const [connection, setConnection] = useState(null);

  useEffect(() => {
    const newConnection = new Connection(clusterApiUrl('mainnet-beta'), 'confirmed');
    setConnection(newConnection);
  }, []);

  const value = {
    connected,
    publicKey,
    connection,
  };

  return (
    <WalletContext.Provider value={value}>
      {children}
    </WalletContext.Provider>
  );
};