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
  const API_KEY = '4eoxf2smJvPYr9lbOYwc_v_VYdph4Ghi';

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

  useEffect(() => {
    const fetchTokenInfo = async () => {
      const mintPubkey = new PublicKey(tokenAddress);

      try {
        const response = await fetch(API_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${API_KEY}`,
          },
          body: JSON.stringify({
            jsonrpc: "2.0",
            id: 1,
            method: "getAccountInfo",
            params: [
              mintPubkey.toBase58(),
              {
                encoding: "base64"
              }
            ],
          }),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        console.log(result);
        
        const accountData = result.result?.value?.data[0];

        if (!accountData) {
          throw new Error('No account data found.');
        }
    
        const decodedData = Buffer.from(accountData, 'base64');
        const humanReadableData = parseTokenAccountData(decodedData);
    
        console.log('Token Info:', humanReadableData);
        setData(humanReadableData);
      } catch (error) {
        console.error('Error fetching token info:', error);
        setError(error.message);
      }
    };

    fetchTokenInfo();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(API_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            jsonrpc: "2.0",
            id: 1,
            method: "getBlockHeight",
            params: [],
          }),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        setData(result);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

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

        {/* <Container maxWidth="m" sx={{ py: 4, background: "linear-gradient(145deg, purple, #2a2a2a)"}}>
          <Container maxWidth="sm" sx={{ py: 4, background: "linear-gradient(145deg, #1e1e1e, #2a2a2a)",
            borderRadius: 4,
            boxShadow: "8px 8px 16px #0b0b0b, -8px -8px 16px #353535",
            border: "1px solid #3c3c3c", }}>
            
            <Typography variant="h4" sx={{
              fontWeight: "bold",
              textShadow: "0 0 5px rgba(255,255,255,0.8), 0 0 10px rgba(255,255,255,0.6)",
              color: "#64cb96",
              marginBottom: 3,}} gutterBottom align="center" color="primary">
              Solana API Test Dashboard
            </Typography>
            
            <Typography variant="p" sx={{ color: "white", textShadow: "0 0 5px #64cb96" }}>This is an example of our API. Much easier said than done of course but this lays the foundation for SolSeaScan.</Typography>
          
            <Paper elevation={3} sx={{ p: 2, backgroundColor: '#f5f5f5' }}>
              <Box sx={{ overflowX: 'auto' }}>
                <Grid container spacing={2}>
                  {Object.entries(data).map(([key, value]) => (
                    <React.Fragment key={key}>
                      <Grid item xs={6}>
                        <Typography variant="subtitle1" color="secondary">
                          {key.charAt(0).toUpperCase() + key.slice(1)}:
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="body1" sx={{ fontFamily: 'monospace', color: '#333' }}>
                          {value !== null ? value.toString() : 'N/A'}
                        </Typography>
                      </Grid>
                    </React.Fragment>
                  ))}
                </Grid>
              </Box>
            </Paper>
          </Container>
        </Container> */}

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