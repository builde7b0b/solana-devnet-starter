import React, { useState, useEffect } from 'react';
import { Container, Typography, Box, Button, CircularProgress, Grid } from '@mui/material';
import * as THREE from 'three';
import { Canvas, useFrame } from '@react-three/fiber';

// Futuristic 3D Token Representation
const TokenSphere = ({ value, color }) => {
  const mesh = React.useRef();
  useFrame(() => (mesh.current.rotation.x = mesh.current.rotation.y += 0.01));
  return (
    <mesh ref={mesh}>
      <sphereGeometry args={[value, 32, 32]} />
      <meshStandardMaterial color={color} />
    </mesh>
  );
};

const RealTimeDashboard = ({ apiUrl, headers, accountPubkey, tokenAccountPubkey }) => {
  const [balance, setBalance] = useState(null);
  const [tokenAccountBalance, setTokenAccountBalance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [solPriceUsd, setSolPriceUsd] = useState(null);
  const [tokenHoldings, setTokenHoldings] = useState([]);



  const fetchSolPrice = async () => {
    try {
      const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd');
      console.log(response.JSON);
      // return response.data.solana.usd;
    } catch (error) {
      console.error('Error fetching SOL price:', error);
      return null;
    }
  };

  const fetchBalance = async () => {
    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...headers,
        },
        body: JSON.stringify({
          jsonrpc: "2.0",
          id: 1,
          method: "getBalance",
          params: [accountPubkey],
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      setBalance(result.result.value / 1e9); // Convert lamports to SOL
    } catch (error) {
      setError(error.message);
    }
  };

  const fetchTokenAccountBalance = async () => {
    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...headers,
        },
        body: JSON.stringify({
          jsonrpc: "2.0",
          id: 1,
          method: "getTokenAccountBalance",
          params: [tokenAccountPubkey],
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      setTokenAccountBalance(result.result.value.uiAmount);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };
  const fetchTokenAccounts = async () => {
    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...headers,
        },
        body: JSON.stringify({
          jsonrpc: "2.0",
          id: 1,
          method: "getTokenAccountsByOwner",
          params: [
            accountPubkey,
            { programId: "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA" },
            { encoding: "jsonParsed" }
          ],
        }),
      });
  
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
  
      const result = await response.json();
      console.log('Token accounts response:', result);
  
      if (result && result.result && result.result.value) {
        const tokenAccounts = result.result.value;
        console.log('Token accounts:', tokenAccounts);
  
        const holdings = await Promise.all(tokenAccounts.map(async (account) => {
          console.log('Processing account:', account);
          const mintAddress = account.account.data.parsed.info.mint;
          const balance = account.account.data.parsed.info.tokenAmount.uiAmount;
  
          // Fetch token metadata (you might need to implement this)
          const metadata = await fetchTokenMetadata(mintAddress);
  
          return {
            mint: mintAddress,
            balance: balance,
            symbol: metadata?.symbol || 'Unknown',
            name: metadata?.name || 'Unknown Token',
          };
        }));
  
        console.log('Processed holdings:', holdings);
        setTokenHoldings(holdings);
      } else {
        console.error('Unexpected response structure:', result);
        setError('Unexpected response structure from API');
      }
    } catch (error) {
      console.error('Error fetching token accounts:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    fetchBalance();
    fetchTokenAccountBalance();
    fetchTokenAccounts();
  }, [apiUrl, accountPubkey, tokenAccountPubkey]);

  useEffect(() => {
    fetchSolPrice().then(price => setSolPriceUsd(price));
  }, []);

  if (loading) return <CircularProgress />;

  const portfolioData = [
    { symbol: 'SOL', balance: balance || 0 },
    { symbol: 'CORSAIR', balance: tokenAccountBalance || 0 },
    ...tokenHoldings
  ];

  const totalValue = (balance || 0) + (tokenAccountBalance || 0);
  const totalValueUsd = solPriceUsd ? (balance || 0) * solPriceUsd + (tokenAccountBalance || 0) * estimatedTokenPrice : null || 0;



  return (
    <Container maxWidth="lg" sx={{
      py: 4,
      background: "linear-gradient(145deg, #1e1e1e, #2a2a2a)",
      borderRadius: 4,
      boxShadow: "8px 8px 16px #0b0b0b, -8px -8px 16px #353535",
      border: "1px solid #3c3c3c",
    }}>
      <Typography variant="h4" gutterBottom align="center" sx={{
        fontWeight: "bold",
        textShadow: "0 0 5px rgba(255,255,255,0.8), 0 0 10px rgba(255,255,255,0.6)",
        color: "#64cb96",
        marginBottom: 3,
      }}>
        Futuristic Portfolio Dashboard
      </Typography>
      
      <Grid container spacing={4}>
        <Grid item xs={12} md={8}>
          <Box sx={{ height: '400px', overflow: 'hidden' }}>
            <Canvas camera={{ position: [0, 0, 20] }}>
              <ambientLight intensity={0.5} />
              <pointLight position={[10, 10, 10]} />
              {portfolioData.map((token, index) => (
                <TokenSphere 
                  key={token.symbol} 
                  value={Math.log(token.balance + 1)} 
                  color={index === 0 ? '#64cb96' : '#1e88e5'}
                  position={[(index - 0.5) * 5, 0, 0]}
                />
              ))}
            </Canvas>
          </Box>
        </Grid>
        <Grid item xs={12} md={4}>
          <Typography variant="h6" sx={{ color: "#ffffff", textShadow: "0 0 5px #64cb96" }}>
            Total Portfolio Value: {totalValueUsd.toFixed(4)}
          </Typography>
          {portfolioData.map((token) => (
            <Box key={token.symbol} sx={{ mb: 2 }}>
              <Typography sx={{ color: "#ffffff", textShadow: "0 0 5px #64cb96" }}>
                {token.symbol}: {token.balance.toFixed(4)}
              </Typography>
            </Box>
          ))}
        </Grid>
      </Grid>
      
      {error && <Typography color="error">{error}</Typography>}
      
      <Button sx={{
        mt: 4,
        background: "linear-gradient(145deg, #64cb96, #1e88e5)",
        boxShadow: "0 4px 15px rgba(0, 176, 255, 0.4)",
        borderRadius: 2,
        transition: "background 0.3s",
        "&:hover": {
          background: "linear-gradient(145deg, #1e88e5, #64cb96)",
          boxShadow: "0 4px 20px rgba(0, 176, 255, 0.6)",
        },
      }} variant="contained" color="primary" onClick={() => { setLoading(true); fetchBalance(); fetchTokenAccountBalance(); }}>
        Refresh Portfolio
      </Button>
    </Container>
  );
};

export default RealTimeDashboard;