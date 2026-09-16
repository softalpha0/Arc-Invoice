"use client";

import type { ReactNode } from "react";
import { useAccount, useSwitchChain } from "wagmi";
import { TARGET_CHAIN_ID } from "@/lib/contract";
import { shortErrorMessage } from "@/lib/errors";

/**
 * Wraps an action (pay, create invoice, ...) that requires the connected
 * wallet to be on Arc. wagmi doesn't switch networks automatically before a
 * write, so without this a wrong-network wallet just throws a raw error.
 */
export function NetworkGuard({ children }: { children: ReactNode }) {
  const { chainId, isConnected } = useAccount();
  const { switchChain, isPending, error } = useSwitchChain();

  if (!isConnected || chainId === TARGET_CHAIN_ID) return <>{children}</>;

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={() => switchChain({ chainId: TARGET_CHAIN_ID })}
        disabled={isPending}
        className="w-full rounded-md bg-accent px-4 py-2 text-sm font-medium text-accent-foreground transition-colors hover:opacity-90 disabled:opacity-50"
      >
        {isPending ? "Switching…" : "Switch wallet to Arc"}
      </button>
      {error && <p className="text-center text-sm text-danger">{shortErrorMessage(error)}</p>}
    </div>
  );
}
