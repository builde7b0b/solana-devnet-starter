import React, { useState, useEffect, useMemo } from 'react';
import { Container, Typography, Box, Button, CircularProgress, Grid } from '@mui/material';
import * as THREE from 'three';
import { Canvas, useFrame } from '@react-three/fiber';

const PieSlice = ({ startAngle, endAngle, radius, color }) => {
  const geometry = useMemo(() => {
    const shape = new THREE.Shape();
    shape.moveTo(0, 0);
    shape.arc(0, 0, radius, startAngle, endAngle, false);
    shape.lineTo(0, 0);
    return new THREE.ShapeGeometry(shape, 32);
  }, [startAngle, endAngle, radius]);

  return (
    <mesh geometry={geometry}>
      <meshStandardMaterial color={color} side={THREE.DoubleSide} />
    </mesh>
  );
};


const TokenPieChart = ({ tokens }) => {
  const mesh = React.useRef();
  const totalValue = tokens.reduce((sum, token) => sum + token.balance, 0);

  useFrame(() => {
    if (mesh.current) {
      mesh.current.rotation.y += 0.005;
    }
  });

  console.log('Tokens received in PieChart:', JSON.stringify(tokens, null, 2));

  const MIN_ANGLE = 0.1; // Minimum angle in radians for small slices
  const SPACING = 0.02; // Spacing between slices in radians

  let startAngle = 0;
  const adjustedTokens = tokens.map(token => ({
    ...token,
    angle: Math.max(MIN_ANGLE, (token.balance / totalValue) * (Math.PI * 2 - SPACING * tokens.length))
  }));

  console.log("ADJUSTED" + adjustedTokens);

  const totalAdjustedAngle = adjustedTokens.reduce((sum, token) => sum + token.angle, 0);

  return (
    <group ref={mesh}>
      {adjustedTokens.map((token, index) => {
        const endAngle = startAngle + token.angle;
        const color = token.symbol === 'SOL' 
  ? '#9945FF' 
  : `hsl(${(index * 137.5 + 60) % 360}, 70%, 60%)`; // Added 60 to shift the hue

        console.log(`Rendering slice for ${token.symbol}: Color=${color}, Angle=${token.angle}`);

        const slice = (
          <PieSlice
            key={token.symbol}
            startAngle={startAngle + SPACING / 2}
            endAngle={endAngle - SPACING / 2}
            radius={5}
            color={color}
          />
        );

        startAngle = endAngle;
        return slice;
      })}
    </group>
  );
};

const RealTimeDashboard = ({ apiUrl, headers, accountPubkey, connection }) => {
  const REQUIRED_TOKEN_ADDRESS = '4RumoqmFmbX1EATWFPuVD75MGK1UxxUqJBbn4tuSpump';

  const [solBalance, setSolBalance] = useState(null);
  const [tokenHoldings, setTokenHoldings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isTokenGated, setIsTokenGated] = useState(false);

  const fetchSolBalance = async () => {
    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: headers,
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
      setSolBalance(result.result.value / 1e9); // Convert lamports to SOL
    } catch (error) {
      console.error('Error fetching SOL balance:', error);
      setError(error.message);
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

        const holdings = tokenAccounts.map(account => {
          const { mint, tokenAmount } = account.account.data.parsed.info;
          return {
            mint,
            balance: tokenAmount.uiAmount,
            symbol: 'UNKNOWN', // You might want to fetch this information separately
            name: 'Unknown Token',
          };
        });

        console.log('Processed holdings:', holdings);
        setTokenHoldings(holdings);
        //Check if the user has the required token
      const hasRequiredToken = holdings.some(token => token.mint === REQUIRED_TOKEN_ADDRESS && token.balance > 0);
      setIsTokenGated(hasRequiredToken);
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
    if (accountPubkey) {
      setLoading(true);
      fetchSolBalance();
      fetchTokenAccounts();
    }
  }, [accountPubkey]);

  if (loading) return <CircularProgress />;

  const portfolioData = [
    { symbol: 'SOL', balance: solBalance || 0 },
    ...tokenHoldings.filter(token => token.symbol !== 'SOL') // Ensure we don't duplicate SOL
  ];

  const totalValue = portfolioData.reduce((sum, token) => sum + token.balance, 0);

  console.log('Portfolio Data:', portfolioData); // Add this line for debugging


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
        Portfolio Dashboard
      </Typography>

      {isTokenGated ? (
      
      <Grid container spacing={4}>
        <Grid item xs={12} md={8}>
          <Box sx={{ height: '400px', overflow: 'hidden' }}>
          <Canvas camera={{ position: [0, -10, 15], up: [0, 0, 1], fov: 60 }}>
  <ambientLight intensity={0.5} />
  <pointLight position={[10, 10, 10]} />
  <TokenPieChart tokens={portfolioData} />
</Canvas>
          </Box>
        </Grid>
        <Grid item xs={12} md={4}>
          <Typography variant="h6" sx={{ color: "#ffffff", textShadow: "0 0 5px #64cb96" }}>
            Total Portfolio Value: {totalValue.toFixed(4)}
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
      ) : (
        // Content for users who don't have the required token
      <Typography variant="h6" sx={{ color: "#ffffff", textShadow: "0 0 5px #64cb96" }}>
      You need to hold the required token to access this dashboard.
    </Typography>


      )}
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
      }} variant="contained" color="primary" onClick={() => { setLoading(true); fetchSolBalance(); fetchTokenAccounts(); }}>
        Refresh Portfolio
      </Button>
    </Container>
  );
};

export default RealTimeDashboard;