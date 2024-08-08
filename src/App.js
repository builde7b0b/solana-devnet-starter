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


const connection = new Connection(
  clusterApiUrl('mainnet-beta'), 'confirmed');

  // Helper function to format supply
const formatSupply = (supply, decimals) => {
  return (supply / Math.pow(10, decimals)).toFixed(decimals);
};

const TokenSupplyDisplay = ({ tokenSupply, decimals }) => {
  const formattedSupply = formatSupply(tokenSupply, decimals);
  const [data, setData] = useState(null);


  return (
    <div>
      <h3>Token Supply</h3>
      <p>{formattedSupply} Tokens</p>
    </div>
  );
};

  // Define your custom RPC URL and API key (if needed)
// const CUSTOM_RPC_URL = 'https://solana-mainnet.g.alchemy.com'; // Replace with your RPC URL
// const API_KEY = '4eoxf2smJvPYr9lbOYwc_v_VYdph4Ghi'; // Replace with your API key

  // Initialize the connection with headers
// const connection = new Connection(CUSTOM_RPC_URL, {
//   commitment: 'confirmed',
//   headers: {
//     'Authorization': `Bearer ${API_KEY}`, // Add your API key here
//   }
// });


function App({ walletConnected, walletPublicKey, connection}) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const tokenAddress = 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA'
   // Example method and params for getSupply
   const getSupplyParams = []; // No params needed for getSupply
   const getTokenSupplyParams = ['6DGGARdpfRGMokNrMMezWEXrEn39SNzM9chBMy4mpump']; // Example params for getTokenSupply
   const API_KEY = '4eoxf2smJvPYr9lbOYwc_v_VYdph4Ghi';

  const API_URL = `https://solana-mainnet.g.alchemy.com/v2/${API_KEY}`;
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${API_KEY}`,
  };

  // Replace with actual public keys
  const accountPubkey = '5pzD3uG435SUvcA5t1qZjePEiFFr8BCdXomTwQdfHMWG';
  const tokenAccountPubkey = '9rEPZiX4JnFDNjL9eo9zZfGUoDNBL2gczrcamtaQexxs';
// Let's get the public key when the user connects their wallet and save it to a state variable. 
// We can then use this public key to fetch the user's token accounts.
 


  useEffect(() => {
    const API_KEY = '4eoxf2smJvPYr9lbOYwc_v_VYdph4Ghi';
    const apiUrl = `https://solana-mainnet.g.alchemy.com/v2/${API_KEY}`;
    const tokenAddress = 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA';

    const fetchTokenInfo = async () => {
      const mintPubkey = new PublicKey(tokenAddress);

      try {
        const response = await fetch(apiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${API_KEY}`, // Include authorization header
          },
          body: JSON.stringify({
            jsonrpc: "2.0",
            id: 1,
            method: "getAccountInfo",
            params: [
              // "HfYFjMKNZygfMC8LsQ8LtpPsPxEJoXJx4M6tqi75Hajo"
              mintPubkey.toBase58(),
              {
                encoding: "base64" // Set the encoding to base64 for the account data
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
    
        // Decode the base64 encoded account data
        const decodedData = Buffer.from(accountData, 'base64');
    
        // Process the decoded data
        const humanReadableData = parseTokenAccountData(decodedData);
    
        console.log('Token Info:', humanReadableData);

        // Process and display token information here
        setData(humanReadableData);
      } catch (error) {
        console.error('Error fetching token info:', error);
        setError(error.message);
      }
    };

    fetchTokenInfo();
  }, []); // Depend on nothing so it runs once on mount

  useEffect(() => {
    // Replace '[API SECRET]' with your actual Alchemy API key
    const API_SECRET = 'your-alchemy-api-key';
    const apiUrl = `https://solana-mainnet.g.alchemy.com/v2/4eoxf2smJvPYr9lbOYwc_v_VYdph4Ghi`;

    const fetchData = async () => {
      try {
        const response = await fetch(apiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            jsonrpc: "2.0",
            id: 1,
            method: "getBlockHeight", // Example RPC method, change as needed
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

  // Function to parse token account data
function parseTokenAccountData(data) {
  // Assuming the structure follows the standard TokenAccount layout
  // This will need to be adjusted based on your specific data structure
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








  async function getTokenInfo(tokenAddress) {
    const mintPubkey = new PublicKey(tokenAddress);
  
    try {
      // Get the mint information (e.g., total supply, decimals)
      const mintInfo = await getMint(connection, mintPubkey);
  
      // Log mint information
      console.log('Mint Info:', mintInfo);
  
      // You can also get token accounts associated with the mint
      const accounts = await connection.getTokenAccountsByOwner(mintPubkey, {
        programId: TOKEN_PROGRAM_ID,
      });
  
      accounts.value.forEach((accountInfo) => {
        const accountData = accountInfo.account.data;
        console.log('Token Account:', accountData);
      });
  
    } catch (error) {
      console.error('Error fetching token info:', error);
    }
  }
  // Example usage
  // getTokenInfo('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA');

  return (
    <CustomWalletConnection>
    <div className="App">
            <Banner />
            <RealTimeDashboard apiUrl={API_URL} accountPubkey={accountPubkey} tokenAccountPubkey={tokenAccountPubkey} />
            {/* <WalletPortfolio connection={connection} /> */}


      <Container maxWidth="m" sx={{ py: 4, background: "linear-gradient(145deg, purple, #2a2a2a)"}}>
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
    </Container>


    {/* Button to trigger the fetch for getTokenSupply */}
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
    {/* SolanaDataDisplay for getTokenSupply */}
    <SolanaDataDisplay
        apiUrl={API_URL}
        method="getTokenSupply"
        params={getTokenSupplyParams}
        headers={headers}
      />

    {/* <h1>Solana API Dashboard</h1> */}
    {/* SolanaDataDisplay for getSupply */}
   

      {/* <h1>Solana Token Dashboard</h1>
      <TokenInfo tokenAddress={tokenAddress} /> */}
      {/* <TokenSupplyDisplay tokenSupply={tokenData.amount} decimals={tokenData.decimals} /> */}
    </div>
    </CustomWalletConnection>
  );
}

export default App;
