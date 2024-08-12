// __tests__/App.test.js

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import App from '../App';
import { WalletContext } from '../WalletContext';

jest.mock('@solana/web3.js', () => ({
  Connection: jest.fn().mockImplementation(() => ({
    getAccountInfo: jest.fn(),
  })),
  PublicKey: jest.fn().mockImplementation((key) => key),
}));

jest.mock('@solana/spl-token', () => ({
  TOKEN_PROGRAM_ID: 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA',
  getAccount: jest.fn(),
  getMint: jest.fn(),
}));

describe('App Component', () => {
  const renderApp = (walletConnected = false, walletPublicKey = null) => {
    render(
      <WalletContext.Provider
        value={{
          connected: walletConnected,
          publicKey: walletPublicKey,
        }}
      >
        <App />
      </WalletContext.Provider>
    );
  };

  it('renders loading state initially', () => {
    renderApp();
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('renders error state when an error occurs', () => {
    const { rerender } = render(
      <WalletContext.Provider value={{ connected: false, publicKey: null }}>
        <App />
      </WalletContext.Provider>
    );
    rerender(
      <WalletContext.Provider value={{ connected: false, publicKey: null }}>
        <App error="Some error" />
      </WalletContext.Provider>
    );

    expect(screen.getByText(/Error:/i)).toBeInTheDocument();
  });

  it('prompts user to connect wallet when not connected', () => {
    renderApp(false, null);
    expect(screen.getByText(/Please connect your wallet/i)).toBeInTheDocument();
  });

  it('displays real-time dashboard when wallet is connected', () => {
    renderApp(true, 'FakePublicKey');
    expect(screen.getByText(/Refresh Token Supply/i)).toBeInTheDocument();
  });

  it('triggers refresh token supply action', () => {
    renderApp(true, 'FakePublicKey');
    const button = screen.getByText(/Refresh Token Supply/i);
    fireEvent.click(button);
    // Additional logic to check the effect of clicking the button can be added here
  });
});
