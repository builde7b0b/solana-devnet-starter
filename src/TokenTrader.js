import React, { useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { Connection, Transaction, SystemProgram, PublicKey } from '@solana/web3.js';
import { TextField, Button, Typography, Box, Container, Avatar } from '@mui/material';
import SniperImage from './assets/sniper.png';


const TokenTrader = ({ sellPublicKey }) => {
    const { publicKey, signTransaction } = useWallet();
    const [status, setStatus] = useState('');
    const [tokenAddress, setTokenAddress] = useState('');

    // Direct connection to Solana mainnet
    const connection = new Connection('https://mainnet.helius-rpc.com/?api-key=', 'confirmed');

    const snipeToken = async () => {
        if (!publicKey) {
            setStatus('Connect your wallet first!');
            return;
        }

        if (!tokenAddress) {
            setStatus('Enter a valid token address!');
            return;
        }

        try {
            // Fetch the latest blockhash
            const latestBlockhash = await connection.getLatestBlockhash('finalized');

            const transaction = new Transaction({
                feePayer: publicKey,
                blockhash: latestBlockhash.blockhash,
                lastValidBlockHeight: latestBlockhash.lastValidBlockHeight,
            }).add(
                SystemProgram.transfer({
                    fromPubkey: publicKey,
                    toPubkey: new PublicKey(tokenAddress),
                    lamports: 1000, // Adjust amount accordingly
                })
            );

            // Sign transaction using the connected wallet
            const signedTransaction = await signTransaction(transaction);

            // Send the signed transaction directly to Solana RPC
            const signature = await connection.sendRawTransaction(signedTransaction.serialize(), {
                skipPreflight: false,
                preflightCommitment: 'confirmed',
            });

            // Confirm transaction
            await connection.confirmTransaction(signature, 'confirmed');

            setStatus(`Buy transaction sent: ${signature}`);
        } catch (error) {
            console.error('Error during transaction:', error);
            setStatus('Buy transaction failed');
        }
    };

    return (
        <Container maxWidth="sm">
            <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography sx={{
        fontWeight: "bold",
        textShadow: "0 0 5px rgba(255,255,255,0.8), 0 0 10px rgba(255,255,255,0.6)",
        color: "#64cb96",
        marginBottom: 3,
      }} variant="h4" gutterBottom>
                    Token Sniper
                </Typography>
                <Avatar
        src={SniperImage} // Replace with your actual image path
        alt="Token Logo"
        sx={{
          width: 80,
          height: 80,
          margin: "0 auto 16px",
          boxShadow: "0 4px 8px rgba(0, 176, 255, 0.5)",
          backgroundColor: "#fff",
        }}
      />
                <TextField
                    label="Token Address"
                    variant="outlined"
                    fullWidth
                    value={tokenAddress}
                    onChange={(e) => setTokenAddress(e.target.value)}
                    sx={{ mb: 2 }}
                />
                <Button variant="contained" color="primary" onClick={snipeToken} sx={{ mr: 2 }}>
                    Snipe Token
                </Button>
                <Typography variant="body1" sx={{ mt: 2, color: 'gray' }}>
                    {status}
                </Typography>
            </Box>
        </Container>
    );
};

export default TokenTrader;
