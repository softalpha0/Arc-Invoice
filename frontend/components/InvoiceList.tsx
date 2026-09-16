"use client";

import Link from "next/link";
import { formatUnits } from "viem";
import { useAccount, useReadContract } from "wagmi";
import { INVOICE_ESCROW_ADDRESS, TARGET_CHAIN_ID, invoiceEscrowAbi } from "@/lib/contract";
import { IconInvoice } from "./icons";

function InvoiceRow({ id }: { id: bigint }) {
  const { data: invoice } = useReadContract({
    address: INVOICE_ESCROW_ADDRESS,
    abi: invoiceEscrowAbi,
    functionName: "getInvoice",
    args: [id],
    chainId: TARGET_CHAIN_ID,
    query: { enabled: !!INVOICE_ESCROW_ADDRESS },
  });

  if (!invoice) return null;

  return (
    <Link
      href={`/invoice/${id.toString()}`}
      className="card-hover flex items-center justify-between rounded-xl border border-border bg-surface px-4 py-3.5 text-sm shadow-sm"
    >
      <div className="flex min-w-0 items-center gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accent/10 text-accent">
          <IconInvoice className="h-4 w-4" />
        </div>
        <div className="min-w-0">
          <p className="truncate font-medium">{invoice.description || `Invoice #${id}`}</p>
          <p className="text-muted-foreground">#{id.toString()}</p>
        </div>
      </div>
      <div className="shrink-0 pl-4 text-right">
        <p className="font-mono">{formatUnits(invoice.amount, 18)} USDC</p>
        <p
          className={
            invoice.paid
              ? "inline-block rounded-full bg-success-bg px-2 py-0.5 text-xs font-medium text-success"
              : "inline-block rounded-full bg-warning-bg px-2 py-0.5 text-xs font-medium text-warning"
          }
        >
          {invoice.paid ? "Paid" : "Pending"}
        </p>
      </div>
    </Link>
  );
}

export function InvoiceList() {
  const { address, isConnected } = useAccount();

  const { data: ids, isLoading } = useReadContract({
    address: INVOICE_ESCROW_ADDRESS,
    abi: invoiceEscrowAbi,
    functionName: "getInvoicesByIssuer",
    args: [address ?? "0x0000000000000000000000000000000000000000"],
    chainId: TARGET_CHAIN_ID,
    query: { enabled: isConnected && !!address && !!INVOICE_ESCROW_ADDRESS },
  });

  if (!isConnected) return null;
  if (isLoading) return <p className="text-sm text-muted-foreground">Loading invoices…</p>;
  if (!ids || ids.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
        No invoices yet. Create one to get started.
      </p>
    );
  }

  return (
    <div className="space-y-2">
      {[...ids].reverse().map((id) => (
        <InvoiceRow key={id.toString()} id={id} />
      ))}
    </div>
  );
}
