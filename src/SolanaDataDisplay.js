// SolanaDataDisplay.js
import React, { useState, useEffect } from 'react';
import { Container, Typography, Paper, Box, CircularProgress, Avatar } from '@mui/material';

import { fetchHeliusData } from '../public/HeliusAPI';

// Example component to fetch and display Solana API data
const SolanaDataDisplay = ({ apiUrl, method, params, headers }) => {
  const [totalSupply, setTotalSupply] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [holders, setHolders] = useState(null);
  const apiKey = "78ce517d-1982-48f7-b4ca-0ada28f0a326"


  function parseApiResponse(response, method) {
    switch (method) {
      case 'getTokenSupply':
        return parseGetTokenSupplyData(response);
      default:
        throw new Error(`Unknown method: ${method}`);
    }
  }

  function parseGetTokenSupplyData(response) {
    if (!response || !response.result) {
      throw new Error('Invalid response format');
    }

    const { amount, decimals } = response.result.value;
    return amount / Math.pow(10, decimals); // Convert to human-readable total supply
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(apiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...headers,
          },
          body: JSON.stringify({
            jsonrpc: '2.0',
            id: 1,
            method,
            params,
          }),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        const parsedTotalSupply = parseApiResponse(result, method);
        setTotalSupply(parsedTotalSupply);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [apiUrl, method, params, headers]);

  const tokenAddress = "A3eME5CetyZPBoWbRUwY3tSe25S6tb18ba9ZPbWk9eFJ";

  // useEffect(() => {
  //   const fetchTokenHolders = async () => {
  //     try {
  //       const url = `https://api.helius.dev/v0/tokens/${tokenAddress}/holders`;
  //       const result = await fetchHeliusData(url, apiKey);
  //       setHolders(result);
  //     } catch (error) {
  //       setError(error.message);
  //     } finally {
  //       setLoading(false);
  //     }
  //   };

  //   fetchTokenHolders();
  // }, [apiKey, tokenAddress]);

  if (loading) {
    return <CircularProgress />;
  }

  return (
    <Container maxWidth="sm" sx={{ py: 4, textAlign: 'center' }}>
      <Typography sx={{
          fontWeight: "bold",
          textShadow: "0 0 5px rgba(255,255,255,0.8), 0 0 10px rgba(255,255,255,0.6)",
          color: "#64cb96",
          marginBottom: 3,}} variant="h4" gutterBottom align="center" color="primary">
        Token Supply Counter
      </Typography>
      <Typography sx={{ color: "#ffffff", textShadow: "0 0 5px #64cb96" }} variant="h6" gutterBottom align="center" color="primary">
        $CORSAIR
      </Typography>
      {/* Token Logo Image */}
      <Avatar
        src="https://cryptocorsair.org/assets/flint-face.png" // Replace with your actual image path
        alt="Token Logo"
        sx={{
          width: 80,
          height: 80,
          margin: "0 auto 16px",
          boxShadow: "0 4px 8px rgba(0, 176, 255, 0.5)",
          backgroundColor: "#fff",
        }}
      />
      <Paper elevation={3} sx={{ p: 4, backgroundColor: '#d1d68b' }}>
        <Box sx={{ overflowX: 'auto' }}>
          {error ? (
            <Typography color="error">{error}</Typography>
          ) : (
            <Typography  variant="h2" sx={{ color: "#ffffff", textShadow: "0 0 5px #64cb96" }}>
              {totalSupply !== null ? totalSupply.toLocaleString() : 'N/A'} Tokens
            </Typography>
          )}
        </Box>
      </Paper>
      
    </Container>
  );
};

export default SolanaDataDisplay;
