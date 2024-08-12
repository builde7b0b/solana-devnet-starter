import React, { useEffect, useState } from 'react';
import { Connection, clusterApiUrl } from '@solana/web3.js';
import { PublicKey } from '@solana/web3.js';
import { TOKEN_PROGRAM_ID, getAccount, getMint } from '@solana/spl-token';
import TokenInfo from './TokenInfo';
import { Button, Container, Typography, Paper, Box, Grid} from '@mui/material';
import SolanaDataDisplay from './SolanaDataDisplay';
import Banner from './Banner';
import WalletConnection from './WalletConnection';
import CustomWalletConnection from './CustomWalletConnection';
import RealTimeDashboard from './RealTimeDashboard';
import WalletPortfolio from './WalletPortfolio';
import { useWalletContext } from './WalletContext';


function App({ walletConnected, walletPublicKey, connection }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const tokenAddress = 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA'
  const getSupplyParams = [];
  const getTokenSupplyParams = ['6DGGARdpfRGMokNrMMezWEXrEn39SNzM9chBMy4mpump'];
  const API_KEY = '';

  const { connected, publicKey } = useWalletContext();


  const API_URL = `https://solana-mainnet.g.alchemy.com/v2/${API_KEY}`;
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${API_KEY}`,
  };

  useEffect(() => {
    if (walletConnected && walletPublicKey) {
      console.log('Wallet connected:', walletPublicKey.toBase58());
      // You can fetch token accounts here if needed
    }
  }, [walletConnected, walletPublicKey]);


  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  function parseTokenAccountData(data) {
    const accountInfo = {
      mint: new PublicKey(data.slice(0, 32)).toBase58(),
      owner: new PublicKey(data.slice(32, 64)).toBase58(),
      amount: parseInt(data.slice(64, 72).readBigUInt64LE(), 10),
      delegate: new PublicKey(data.slice(72, 104)).toBase58(),
      state: data[104],
      isNative: data.slice(105, 113).readBigUInt64LE() !== BigInt(0),
      delegatedAmount: parseInt(data.slice(113, 121).readBigUInt64LE(), 10),
      closeAuthority: new PublicKey(data.slice(121, 153)).toBase58()
    };

    return accountInfo;
  }

  return (
      <div className="App">
        {/* <Banner /> */}
        {connected && publicKey ? (
          <RealTimeDashboard 
            apiUrl={API_URL} 
            headers={headers}
            accountPubkey={publicKey} 
            connection={connection}
          />
        ) : (
          <Typography variant="h6" sx={{ color: "#ffffff", textShadow: "0 0 5px #64cb96" }}>
            Please connect your wallet to view your portfolio
          </Typography>
        )}

     

        <Button
          variant="contained"
          color="primary"
          onClick={() => {
            // Use a ref or state to trigger the fetch
          }}
          sx={{
            mt: 2,
            background: "linear-gradient(145deg, #64cb96, #1e88e5)",
            boxShadow: "0 4px 15px rgba(0, 176, 255, 0.4)",
            borderRadius: 2,
            transition: "background 0.3s",
            "&:hover": {
              background: "linear-gradient(145deg, #1e88e5, #64cb96)",
              boxShadow: "0 4px 20px rgba(0, 176, 255, 0.6)",
            },
          }}
        >
          Refresh Token Supply
        </Button>
        <SolanaDataDisplay
          apiUrl={API_URL}
          method="getTokenSupply"
          params={getTokenSupplyParams}
          headers={headers}
        />
      </div>
  );
}

export default App;