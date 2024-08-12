// src/TokenInfo.js

import React, { useEffect, useState } from 'react';
import { Connection, PublicKey } from '@solana/web3.js';
import { getMint, TOKEN_PROGRAM_ID } from '@solana/spl-token';

const API_KEY = '4eoxf2smJvPYr9lbOYwc_v_VYdph4Ghi'; // Replace with your actual API key
const apiUrl = `https://solana-mainnet.g.alchemy.com/v2/${API_KEY}`;

const connection = new Connection(apiUrl, 'confirmed');

const TokenInfo = ({ tokenAddress }) => {
  const [tokenData, setTokenData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  async function fetchTokenInfo() {
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
      setTokenData(humanReadableData);
      console.log(tokenData);
    } catch (error) {
      console.error('Error fetching token info:', error);
      setError(error.message);
    }
  };

  useEffect(() => {
    // const fetchTokenData = async () => {
    //   try {
    //     const mintPubkey = new PublicKey(tokenAddress);

    //     const response = await fetch(apiUrl, {
    //       method: 'POST',
    //       headers: {
    //         'Content-Type': 'application/json',
    //         'Authorization': `Bearer ${API_KEY}`,
    //       },
    //       body: JSON.stringify({
    //         jsonrpc: "2.0",
    //         id: 1,
    //         method: "getAccountInfo",
    //         params: [
    //           mintPubkey.toBase58(),
    //           { encoding: "base64" },
    //         ],
    //       }),
    //     });

    //     if (!response.ok) {
    //       throw new Error(`HTTP error! status: ${response.status}`);
    //     }

    //     const result = await response.json();

    //     if (!result.result) {
    //       throw new Error('No data found for the token.');
    //     }

    //     // Decode and process the account data
    //     const accountData = result.result.value.data[0];
    //     const decodedData = Buffer.from(accountData, 'base64');
    //     const readableData = parseTokenAccountData(decodedData);

    //     setTokenData(readableData);
    //   } catch (error) {
    //     setError(error.message);
    //   } finally {
    //     setLoading(false);
    //   }
    // };

    fetchTokenInfo();
  }, [tokenAddress]);

  const parseTokenAccountData = (data) => {
    return {
      mint: new PublicKey(data.slice(0, 32)).toBase58(),
      owner: new PublicKey(data.slice(32, 64)).toBase58(),
      amount: parseInt(data.slice(64, 72).readBigUInt64LE(), 10),
      delegate: new PublicKey(data.slice(72, 104)).toBase58(),
      state: data[104],
      isNative: data.slice(105, 113).readBigUInt64LE() !== BigInt(0),
      delegatedAmount: parseInt(data.slice(113, 121).readBigUInt64LE(), 10),
      closeAuthority: new PublicKey(data.slice(121, 153)).toBase58()
    };
  };

  const handleRefresh = () => {
    setLoading(true);
    setTokenData(null);
    setError(null);
    fetchTokenInfo();
  };

  return (
    <div>
      <h2>Token Information</h2>
      {loading ? (
        <p>Loading...</p>
      ) : error ? (
        <p>Error: {error}</p>
      ) : (
        <pre>{JSON.stringify(tokenData, null, 2)}</pre>
      )}
      <button onClick={handleRefresh}>Refresh Token Info</button>
    </div>
  );
};

export default TokenInfo;
