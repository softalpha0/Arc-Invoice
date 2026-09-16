# Arc Invoice

Instant USDC invoicing on [Arc](https://arc.io) mainnet. Create an invoice,
share the link, get paid — settlement is a single native-currency transfer
because USDC *is* Arc's native gas token, so there's no ERC-20
approve/transferFrom step.

- `contracts/` — the `InvoiceEscrow` Solidity contract (Hardhat)
- `frontend/` — Next.js app to create and pay invoices

## How it works

1. A freelancer creates an invoice (amount, description, optional due date,
   optional specific payer) — this calls `createInvoice` on-chain and returns
   an invoice ID.
2. They share the link `/invoice/<id>`.
3. The payer opens the link and pays in one click — a native USDC transfer
   forwarded straight to the issuer, and the invoice flips to "Paid" on-chain.

## Quickstart

```bash
# 1. Deploy the contract
cd contracts
npm install
cp .env.example .env   # fill in PRIVATE_KEY
npx hardhat test
npx hardhat run scripts/deploy.js --network arcTestnet   # or arcMainnet

# 2. Run the frontend
cd ../frontend
npm install
cp .env.local.example .env.local   # paste the deployed contract address
npm run dev
```

## Network

| | Mainnet | Testnet |
|---|---|---|
| Chain ID | 5042 | 5042002 |
| RPC | https://rpc.mainnet.arc.io | https://rpc.testnet.arc.io |
| Explorer | https://explorer.arc.io | https://explorer.testnet.arc.io |
| Faucet | — | https://faucet.circle.com |

Built for the [Arc Microgrants](https://arc.io) program.
