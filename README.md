# Arc Invoice

Instant USDC invoicing on [Arc](https://arc.io) mainnet. Create an invoice,
share a link or QR code, get paid — settlement is a single native-currency
transfer because USDC *is* Arc's native gas token, so there's no ERC-20
approve/transferFrom step, no card processor, and no multi-day bank clearing.

- `contracts/` — the `InvoiceEscrow` Solidity contract (Hardhat)
- `frontend/` — Next.js app to create, share, and pay invoices

## What it is

A minimal, on-chain invoicing tool. An issuer creates an invoice (amount,
description, optional due date, optional specific payer), gets back a
shareable link and QR code, and the payer settles it in one transaction —
USDC moves straight from payer to issuer, and the invoice flips to "Paid"
on-chain. No accounts, no intermediary holding funds, no processor cut.

## Who it's for

- **Freelancers and independent contractors** getting paid by clients who
  hold USDC — designers, developers, writers, consultants.
- **Small teams and agencies** invoicing clients without wiring up a payment
  processor or waiting on cross-border bank transfers.
- **DAOs and on-chain-native teams** paying contributors or vendors where
  the payer already operates in USDC.
- **Anyone doing a one-off USDC-denominated sale** — a QR code is enough to
  collect payment in person or over chat, no storefront required.

## Go-to-market

1. **Arc-native early adopters first.** Arc's own builder community and the
   Microgrants program are the initial audience — people who already hold
   USDC on Arc and want a lightweight way to bill each other.
2. **Wedge: cross-border freelance payments.** The clearest pain this
   replaces is a freelancer waiting days for an international wire or
   losing a cut to a card processor. That's the pitch to lead with outside
   the crypto-native crowd.
3. **Distribution through where freelancers already are** — indie hacker
   and remote-work communities, crypto Twitter/Farcaster, and direct
   integration into tools freelancers use (README/invite links, Notion,
   Discord bots) rather than a new destination site to remember.
4. **Expand from single invoices to what a real invoicing tool needs** —
   recurring/subscription billing, multi-payer split invoices, and a
   dashboard for accountants — once the core loop (create → share → get
   paid) has real usage.

## Network

| | |
|---|---|
| Chain ID | 5042 |
| RPC | https://rpc.mainnet.arc.io |
| Explorer | https://explorer.arc.io |

