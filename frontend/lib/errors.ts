export function shortErrorMessage(error: unknown): string | null {
  if (!error) return null;
  const message = error instanceof Error ? error.message : String(error);

  if (/User rejected|user rejected|denied/i.test(message)) {
    return "Request rejected in wallet.";
  }
  if (/insufficient funds/i.test(message)) {
    return "Insufficient USDC balance to cover this payment and gas.";
  }
  if (/chain/i.test(message) && /match|mismatch|expected/i.test(message)) {
    return "Wallet is on the wrong network.";
  }

  // Fall back to the first line, which is usually the human-readable part —
  // everything after it is stack/contract-call debug output from viem.
  const firstLine = message.split("\n")[0]?.trim();
  return firstLine && firstLine.length < 160 ? firstLine : "Something went wrong. Please try again.";
}
