"use client";

import { use } from "react";
import { formatUnits } from "viem";
import { useAccount, useReadContract, useWaitForTransactionReceipt, useWriteContract } from "wagmi";
import { SiteHeader } from "@/components/SiteHeader";
import { InvoiceShare } from "@/components/InvoiceShare";
import { INVOICE_ESCROW_ADDRESS, TARGET_CHAIN_ID, invoiceEscrowAbi } from "@/lib/contract";

export default function InvoicePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const invoiceId = BigInt(id);
  const { address, isConnected } = useAccount();

  const { data: invoice, isLoading, error, refetch } = useReadContract({
    address: INVOICE_ESCROW_ADDRESS,
    abi: invoiceEscrowAbi,
    functionName: "getInvoice",
    args: [invoiceId],
    chainId: TARGET_CHAIN_ID,
    query: { enabled: !!INVOICE_ESCROW_ADDRESS },
  });

  const { writeContract, data: hash, isPending, error: writeError } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const dueDate = invoice?.dueDate ? new Date(Number(invoice.dueDate) * 1000) : null;
  const canPay =
    invoice &&
    !invoice.paid &&
    isConnected &&
    (invoice.payer === "0x0000000000000000000000000000000000000000" || invoice.payer === address);

  function pay() {
    if (!INVOICE_ESCROW_ADDRESS || !invoice) return;
    writeContract({
      address: INVOICE_ESCROW_ADDRESS,
      abi: invoiceEscrowAbi,
      chainId: TARGET_CHAIN_ID,
      functionName: "payInvoice",
      args: [invoiceId],
      value: invoice.amount,
    });
  }

  return (
    <div className="mx-auto flex w-full max-w-md flex-1 flex-col gap-6 px-4 py-6">
      <SiteHeader back />

      {!INVOICE_ESCROW_ADDRESS && (
        <p className="text-sm text-danger">
          Contract address not configured (NEXT_PUBLIC_INVOICE_ESCROW_ADDRESS).
        </p>
      )}

      {isLoading && <p className="text-sm text-muted-foreground">Loading invoice…</p>}
      {error && <p className="text-sm text-danger">Invoice not found.</p>}

      {invoice && (
        <div className="animate-fade-up space-y-4 rounded-xl border border-border bg-surface p-6 shadow-sm">
          <div>
            <p className="text-sm text-muted-foreground">Invoice #{id}</p>
            <h1 className="text-lg font-semibold">{invoice.description}</h1>
          </div>

          <div className="flex items-baseline justify-between border-t border-border pt-4">
            <span className="text-sm text-muted-foreground">Amount</span>
            <span className="font-mono text-xl">{formatUnits(invoice.amount, 18)} USDC</span>
          </div>

          <div className="flex flex-col gap-0.5 text-sm sm:flex-row sm:justify-between sm:gap-4">
            <span className="shrink-0 text-muted-foreground">From</span>
            <span className="break-all font-mono sm:text-right">{invoice.issuer}</span>
          </div>

          {dueDate && (
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Due</span>
              <span>{dueDate.toLocaleDateString()}</span>
            </div>
          )}

          {invoice.payer !== "0x0000000000000000000000000000000000000000" && (
            <div className="flex flex-col gap-0.5 text-sm sm:flex-row sm:justify-between sm:gap-4">
              <span className="shrink-0 text-muted-foreground">Payer</span>
              <span className="break-all font-mono sm:text-right">{invoice.payer}</span>
            </div>
          )}

          <div className="pt-2">
            {invoice.paid ? (
              <p className="rounded-md bg-success-bg px-3 py-2 text-center text-sm font-medium text-success">
                Paid
              </p>
            ) : !isConnected ? (
              <p className="text-center text-sm text-muted-foreground">Connect your wallet to pay.</p>
            ) : !canPay ? (
              <p className="text-center text-sm text-warning">
                This invoice is restricted to a specific payer address.
              </p>
            ) : (
              <button
                onClick={pay}
                disabled={isPending || isConfirming}
                className="w-full rounded-md bg-accent px-4 py-2 text-sm font-medium text-accent-foreground transition-colors hover:opacity-90 disabled:opacity-50"
              >
                {isPending ? "Confirm in wallet…" : isConfirming ? "Paying…" : `Pay ${formatUnits(invoice.amount, 18)} USDC`}
              </button>
            )}
            {writeError && <p className="mt-2 text-sm text-danger">{writeError.message}</p>}
            {isSuccess && (
              <p className="mt-2 text-center text-sm text-success">
                Payment confirmed.{" "}
                <button className="underline" onClick={() => refetch()}>
                  Refresh
                </button>
              </p>
            )}
          </div>
        </div>
      )}

      {invoice && !invoice.paid && <InvoiceShare invoiceId={id} />}
    </div>
  );
}
