"use client";

import { useAccount, useReadContract } from "wagmi";
import { SiteHeader } from "@/components/SiteHeader";
import { CreateInvoiceForm } from "@/components/CreateInvoiceForm";
import { InvoiceList } from "@/components/InvoiceList";
import { IconInvoice, IconShare, IconCheck } from "@/components/icons";
import { INVOICE_ESCROW_ADDRESS, TARGET_CHAIN_ID, invoiceEscrowAbi } from "@/lib/contract";

const STEPS = [
  {
    icon: IconInvoice,
    title: "Create an invoice",
    body: "Set an amount, description, and optional due date. Connect your wallet and confirm.",
  },
  {
    icon: IconShare,
    title: "Share the link",
    body: "Every invoice gets a shareable link and QR code — send it or display it for someone to scan.",
  },
  {
    icon: IconCheck,
    title: "Get paid on-chain",
    body: "Payment is a direct USDC transfer settled on Arc — no intermediary, no card fees.",
  },
];

function Landing() {
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col items-center gap-16 px-4 py-20 text-center">
      <div className="animate-fade-up flex flex-col items-center gap-5">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface px-3 py-1 text-xs font-medium text-muted-foreground">
          <span className="h-1.5 w-1.5 rounded-full bg-success" />
          Live on Arc mainnet
        </span>
        <h1 className="max-w-xl text-4xl font-semibold tracking-tight sm:text-6xl">
          Get paid in{" "}
          <span className="bg-gradient-to-r from-accent to-[#a78bfa] bg-clip-text text-transparent">
            USDC
          </span>
          , instantly.
        </h1>
        <p className="max-w-md text-balance text-base text-muted-foreground">
          Create an invoice, share a link or QR code, get paid on-chain in seconds.
          No approvals, no processors, no waiting for a bank transfer to clear.
        </p>
      </div>

      <div className="grid w-full grid-cols-1 gap-4 text-left sm:grid-cols-3">
        {STEPS.map((item, i) => (
          <div
            key={item.title}
            className="card-hover animate-fade-up rounded-xl border border-border bg-surface p-5"
            style={{ animationDelay: `${i * 80}ms` }}
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-accent/10 text-accent">
              <item.icon className="h-4 w-4" />
            </div>
            <h3 className="mt-3 text-sm font-semibold">{item.title}</h3>
            <p className="mt-1.5 text-sm text-muted-foreground">{item.body}</p>
          </div>
        ))}
      </div>

      <p className="text-sm text-muted-foreground">
        Connect your wallet above to create your first invoice.
      </p>
    </div>
  );
}

function StatTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border bg-surface px-4 py-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 font-mono text-lg">{value}</p>
    </div>
  );
}

function DashboardStats() {
  const { address, isConnected } = useAccount();

  const { data: ids } = useReadContract({
    address: INVOICE_ESCROW_ADDRESS,
    abi: invoiceEscrowAbi,
    functionName: "getInvoicesByIssuer",
    args: [address ?? "0x0000000000000000000000000000000000000000"],
    chainId: TARGET_CHAIN_ID,
    query: { enabled: isConnected && !!address && !!INVOICE_ESCROW_ADDRESS },
  });

  // Individual invoice amounts/paid state are fetched by InvoiceList's rows;
  // here we only need the count, which is cheap and always available.
  const total = ids?.length ?? 0;

  return (
    <div className="mb-6 grid grid-cols-3 gap-3 animate-fade-up">
      <StatTile label="Invoices" value={String(total)} />
      <StatTile label="Network" value="Arc" />
      <StatTile label="Currency" value="USDC" />
    </div>
  );
}

function Dashboard() {
  return (
    <div className="w-full flex-1 py-6">
      <DashboardStats />
      <div className="grid w-full gap-8 lg:grid-cols-[380px_1fr]">
        <section className="animate-fade-up">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            New invoice
          </h2>
          <CreateInvoiceForm />
        </section>

        <section className="animate-fade-up">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Your invoices
          </h2>
          <InvoiceList />
        </section>
      </div>
    </div>
  );
}

export default function Home() {
  const { isConnected } = useAccount();

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-4 py-6">
      <SiteHeader />
      {isConnected ? <Dashboard /> : <Landing />}
    </div>
  );
}
