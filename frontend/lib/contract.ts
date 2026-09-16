import { arcTestnet } from "./chains";

export const INVOICE_ESCROW_ADDRESS = process.env
  .NEXT_PUBLIC_INVOICE_ESCROW_ADDRESS as `0x${string}` | undefined;

export const TARGET_CHAIN_ID = process.env.NEXT_PUBLIC_CHAIN_ID
  ? Number(process.env.NEXT_PUBLIC_CHAIN_ID)
  : arcTestnet.id;

export const invoiceEscrowAbi = [
  { inputs: [], name: "AlreadyPaid", type: "error" },
  { inputs: [], name: "InvoiceNotFound", type: "error" },
  { inputs: [], name: "NotTheDesignatedPayer", type: "error" },
  { inputs: [], name: "TransferFailed", type: "error" },
  { inputs: [], name: "WrongAmount", type: "error" },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: "uint256", name: "id", type: "uint256" },
      { indexed: true, internalType: "address", name: "issuer", type: "address" },
      { indexed: true, internalType: "address", name: "payer", type: "address" },
      { indexed: false, internalType: "uint256", name: "amount", type: "uint256" },
      { indexed: false, internalType: "uint256", name: "dueDate", type: "uint256" },
      { indexed: false, internalType: "string", name: "description", type: "string" },
    ],
    name: "InvoiceCreated",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: "uint256", name: "id", type: "uint256" },
      { indexed: true, internalType: "address", name: "payer", type: "address" },
      { indexed: false, internalType: "uint256", name: "amount", type: "uint256" },
    ],
    name: "InvoicePaid",
    type: "event",
  },
  {
    inputs: [
      { internalType: "uint96", name: "amount", type: "uint96" },
      { internalType: "uint40", name: "dueDate", type: "uint40" },
      { internalType: "address", name: "payer", type: "address" },
      { internalType: "string", name: "description", type: "string" },
    ],
    name: "createInvoice",
    outputs: [{ internalType: "uint256", name: "id", type: "uint256" }],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint256", name: "id", type: "uint256" }],
    name: "getInvoice",
    outputs: [
      {
        components: [
          { internalType: "address payable", name: "issuer", type: "address" },
          { internalType: "address", name: "payer", type: "address" },
          { internalType: "uint96", name: "amount", type: "uint96" },
          { internalType: "uint40", name: "dueDate", type: "uint40" },
          { internalType: "bool", name: "paid", type: "bool" },
          { internalType: "string", name: "description", type: "string" },
        ],
        internalType: "struct InvoiceEscrow.Invoice",
        name: "",
        type: "tuple",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "issuer", type: "address" }],
    name: "getInvoicesByIssuer",
    outputs: [{ internalType: "uint256[]", name: "", type: "uint256[]" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "nextInvoiceId",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint256", name: "id", type: "uint256" }],
    name: "payInvoice",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },
] as const;
