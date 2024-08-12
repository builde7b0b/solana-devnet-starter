import React, { useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { Keypair, Transaction, SystemProgram } from '@solana/web3.js';

const SniperBot = ({ apiUrl }) => {
    const { publicKey, signTransaction } = useWallet();
    const [status, setStatus] = useState('');

    const snipeToken = async () => {
        if (!publicKey) {
            setStatus('Connect your wallet first!');
            return;
        }

        try {
            // Transaction setup
            const transaction = new Transaction().add(
                SystemProgram.transfer({
                    fromPubkey: publicKey,
                    toPubkey: new PublicKey('TargetPublicKeyHere'), // replace with actual target
                    lamports: 1000, // amount in lamports
                })
            );

            const signedTransaction = await signTransaction(transaction);

            const response = await fetch(`${apiUrl}/send`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    transaction: signedTransaction.serialize().toString('base64'),
                }),
            });

            const result = await response.json();
            setStatus(`Transaction sent: ${result.txId}`);
        } catch (error) {
            console.error(error);
            setStatus('Transaction failed');
        }
    };

    return (
        <div>
            <button onClick={snipeToken}>Snipe Token</button>
            <p>{status}</p>
        </div>
    );
};

export default SniperBot;
