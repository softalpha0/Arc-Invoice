# InvoiceEscrow contracts

Minimal on-chain invoicing for Arc. USDC is Arc's native gas token, so
payment is a plain native-value transfer — no ERC-20 approve/transferFrom step.

## Setup

```bash
npm install
cp .env.example .env
# fill in PRIVATE_KEY with a funded Arc mainnet account
```

## Test

```bash
npx hardhat test
```

## Deploy

```bash
npx hardhat run scripts/deploy.js --network arcMainnet
```

## Network reference

| | |
|---|---|
| Chain ID | 5042 |
| RPC | https://rpc.mainnet.arc.io |
| Explorer | https://explorer.arc.io |

After deploying, copy the printed contract address into
`frontend/.env.local` as `NEXT_PUBLIC_INVOICE_ESCROW_ADDRESS`.
