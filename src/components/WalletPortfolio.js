// WalletPortfolio.js
import React, { useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { Connection, PublicKey } from '@solana/web3.js';
import { TOKEN_PROGRAM_ID } from '@solana/spl-token';
import { 
  Container, Typography, Paper, Box, CircularProgress, 
  List, ListItem, ListItemText, Divider, Grid
} from '@mui/material';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend);

const WalletPortfolio = ({ connection }) => {
  const { publicKey } = useWallet();
  const [portfolioData, setPortfolioData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPortfolioData = async () => {
      if (!publicKey) {
        setLoading(false);
        return;
      }

      try {
        const tokenAccounts = await connection.getParsedTokenAccountsByOwner(publicKey, {
          programId: TOKEN_PROGRAM_ID,
        });

        const portfolioItems = await Promise.all(
          tokenAccounts.value.map(async (accountInfo) => {
            const mintAddress = accountInfo.account.data.parsed.info.mint;
            const balance = accountInfo.account.data.parsed.info.tokenAmount.uiAmount;
            
            // Fetch token metadata (you might need to implement this function)
            const metadata = await fetchTokenMetadata(mintAddress);
            console.log(balance, mintAddress);
            
            return {
              mint: mintAddress,
              balance,
              symbol: metadata?.symbol || 'Unknown',
              name: metadata?.name || 'Unknown Token',
              icon: metadata?.icon || null,
            };
          })
        );

        setPortfolioData(portfolioItems);
      } catch (err) {
        console.error('Error fetching portfolio data:', err);
        setError('Failed to load portfolio data');
      } finally {
        setLoading(false);
      }
    };

    fetchPortfolioData();
  }, [publicKey, connection]);

  if (!publicKey) {
    return (
      <Container maxWidth="sm" sx={{ mt: 4, textAlign: 'center' }}>
        <Typography variant="h6" color="textSecondary">
          Please connect your wallet to view your portfolio
        </Typography>
      </Container>
    );
  }

  if (loading) {
    return <CircularProgress sx={{ display: 'block', margin: 'auto', mt: 4 }} />;
  }

  if (error) {
    return (
      <Container maxWidth="sm" sx={{ mt: 4, textAlign: 'center' }}>
        <Typography color="error">{error}</Typography>
      </Container>
    );
  }

  const chartData = {
    labels: portfolioData.map(item => item.symbol),
    datasets: [
      {
        data: portfolioData.map(item => item.balance),
        backgroundColor: [
          '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40'
        ],
        hoverBackgroundColor: [
          '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40'
        ]
      }
    ]
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom sx={{
        fontWeight: "bold",
        textShadow: "0 0 5px rgba(255,255,255,0.8), 0 0 10px rgba(255,255,255,0.6)",
        color: "#64cb96",
        marginBottom: 3,
      }}>
        Your Solana Portfolio
      </Typography>
      <Grid container spacing={4}>
        <Grid item xs={12} md={6}>
          <Paper elevation={3} sx={{ p: 3, bgcolor: 'background.paper', borderRadius: 2 }}>
            <Typography variant="h6" gutterBottom>Holdings</Typography>
            <List>
              {portfolioData.map((item, index) => (
                <React.Fragment key={item.mint}>
                  <ListItem>
                    <ListItemText 
                      primary={`${item.symbol} - ${item.balance.toFixed(2)}`}
                      secondary={item.name}
                    />
                  </ListItem>
                  {index < portfolioData.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper elevation={3} sx={{ p: 3, bgcolor: 'background.paper', borderRadius: 2 }}>
            <Typography variant="h6" gutterBottom>Portfolio Distribution</Typography>
            <Box sx={{ height: 300 }}>
              <Doughnut data={chartData} options={{ maintainAspectRatio: false }} />
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default WalletPortfolio;

// Placeholder for fetchTokenMetadata function
// You'll need to implement this to fetch token metadata
const fetchTokenMetadata = async (mintAddress) => {
  // Implement token metadata fetching logic here
  // This might involve calling an API or using a token list
  return {
    symbol: 'TOKEN',
    name: 'Unknown Token',
    icon: null,
  };
};