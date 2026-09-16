"use client";

import { useMemo, useState } from "react";
import { parseUnits, isAddress, decodeEventLog, type Address } from "viem";
import { useAccount, useSwitchChain, useWaitForTransactionReceipt, useWriteContract } from "wagmi";
import { INVOICE_ESCROW_ADDRESS, TARGET_CHAIN_ID, invoiceEscrowAbi } from "@/lib/contract";
import { shortErrorMessage } from "@/lib/errors";
import { InvoiceShare } from "./InvoiceShare";
import { NetworkGuard } from "./NetworkGuard";
import Link from "next/link";

export function CreateInvoiceForm() {
  const { isConnected, chainId } = useAccount();
  const { switchChainAsync } = useSwitchChain();
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [payer, setPayer] = useState("");
  const [error, setError] = useState<string | null>(null);

  const { writeContract, data: hash, isPending, error: writeError, reset } = useWriteContract();
  const { data: receipt, isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const newInvoiceId = useMemo(() => {
    if (!receipt || !INVOICE_ESCROW_ADDRESS) return null;
    for (const log of receipt.logs) {
      if (log.address.toLowerCase() !== INVOICE_ESCROW_ADDRESS.toLowerCase()) continue;
      try {
        const decoded = decodeEventLog({ abi: invoiceEscrowAbi, ...log });
        if (decoded.eventName === "InvoiceCreated") return decoded.args.id.toString();
      } catch {
        // not this event, keep scanning
      }
    }
    return null;
  }, [receipt]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!INVOICE_ESCROW_ADDRESS) {
      setError("Contract address not configured (NEXT_PUBLIC_INVOICE_ESCROW_ADDRESS).");
      return;
    }
    if (!description.trim()) {
      setError("Description is required.");
      return;
    }
    let amountWei: bigint;
    try {
      amountWei = parseUnits(amount, 18);
      if (amountWei <= BigInt(0)) throw new Error();
    } catch {
      setError("Enter a valid amount.");
      return;
    }
    if (payer && !isAddress(payer)) {
      setError("Payer must be a valid address, or left blank.");
      return;
    }
    if (chainId !== TARGET_CHAIN_ID) {
      try {
        await switchChainAsync({ chainId: TARGET_CHAIN_ID });
      } catch (err) {
        setError(shortErrorMessage(err) ?? "Switch your wallet to Arc to continue.");
        return;
      }
    }
    const dueDateSeconds = dueDate ? Math.floor(new Date(dueDate).getTime() / 1000) : 0;

    writeContract({
      address: INVOICE_ESCROW_ADDRESS,
      abi: invoiceEscrowAbi,
      chainId: TARGET_CHAIN_ID,
      functionName: "createInvoice",
      args: [
        amountWei,
        dueDateSeconds,
        (payer || "0x0000000000000000000000000000000000000000") as Address,
        description.trim(),
      ],
    });
  }

  if (!isConnected) {
    return (
      <p className="rounded-xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
        Connect your wallet to create an invoice.
      </p>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-4 rounded-xl border border-border bg-surface p-6 shadow-sm">
      <div>
        <label className="mb-1 block text-sm font-medium">Description</label>
        <input
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Logo design, March consulting, etc."
          className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none transition-colors focus:border-accent"
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="mb-1 block text-sm font-medium">Amount (USDC)</label>
          <input
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="100.00"
            inputMode="decimal"
            className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none transition-colors focus:border-accent"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Due date (optional)</label>
          <input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none transition-colors focus:border-accent"
          />
        </div>
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium">
          Payer address (optional — leave blank to let anyone pay)
        </label>
        <input
          value={payer}
          onChange={(e) => setPayer(e.target.value)}
          placeholder="0x…"
          className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm font-mono outline-none transition-colors focus:border-accent"
        />
      </div>

      {(error || writeError) && (
        <p className="text-sm text-danger">{error ?? shortErrorMessage(writeError)}</p>
      )}

      <NetworkGuard>
        <button
          type="submit"
          disabled={isPending || isConfirming}
          className="w-full rounded-md bg-accent px-4 py-2 text-sm font-medium text-accent-foreground transition-colors hover:opacity-90 disabled:opacity-50"
        >
          {isPending ? "Confirm in wallet…" : isConfirming ? "Creating invoice…" : "Create invoice"}
        </button>
      </NetworkGuard>

      {isSuccess && (
        <div className="animate-fade-up space-y-4 border-t border-border pt-4">
          <p className="text-sm text-success">
            Invoice created.{" "}
            <button type="button" className="underline" onClick={() => { setDescription(""); setAmount(""); setDueDate(""); setPayer(""); reset(); }}>
              Create another
            </button>
          </p>
          {newInvoiceId && (
            <>
              <InvoiceShare invoiceId={newInvoiceId} />
              <Link
                href={`/invoice/${newInvoiceId}`}
                className="block text-center text-sm text-muted-foreground underline"
              >
                Open invoice page
              </Link>
            </>
          )}
        </div>
      )}
    </form>
  );
}
