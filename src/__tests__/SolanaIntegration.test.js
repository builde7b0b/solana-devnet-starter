// __tests__/SolanaIntegration.test.js

import { rest } from 'msw';
import { setupServer } from 'msw/node';
import { render, screen } from '@testing-library/react';
import App from '../App';
import { WalletContext } from '../WalletContext';

const server = setupServer(
  rest.post('https://solana-mainnet.g.alchemy.com/v2/:apiKey', (req, res, ctx) => {
    return res(ctx.json({ result: { value: { uiAmountString: '1000' } } }));
  })
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('Solana Integration Tests', () => {
  it('fetches and displays token supply from Solana', async () => {
    render(
      <WalletContext.Provider value={{ connected: true, publicKey: 'FakePublicKey' }}>
        <App />
      </WalletContext.Provider>
    );

    expect(await screen.findByText(/1000/i)).toBeInTheDocument();
  });
});
