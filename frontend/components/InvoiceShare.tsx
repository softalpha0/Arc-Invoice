"use client";

import { useEffect, useState } from "react";
import { QRCodeSVG } from "qrcode.react";

export function InvoiceShare({ invoiceId }: { invoiceId: string }) {
  const [url, setUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setUrl(`${window.location.origin}/invoice/${invoiceId}`);
  }, [invoiceId]);

  if (!url) return null;

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(url!);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // clipboard API unavailable; user can still select the text field manually
    }
  }

  return (
    <div className="animate-fade-up flex flex-col items-center gap-3 rounded-xl border border-border bg-surface p-6 shadow-sm">
      <div className="rounded-md bg-white p-3">
        <QRCodeSVG value={url} size={176} />
      </div>
      <div className="flex w-full items-center gap-2">
        <input
          readOnly
          value={url}
          onFocus={(e) => e.currentTarget.select()}
          className="w-full min-w-0 rounded-md border border-border bg-background px-3 py-2 text-xs font-mono"
        />
        <button
          type="button"
          onClick={copyLink}
          className="shrink-0 rounded-md border border-border px-3 py-2 text-xs font-medium transition-colors hover:bg-background"
        >
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <p className="text-center text-xs text-muted-foreground">
        Scan the QR code or share the link — anyone who opens it can pay this invoice.
      </p>
    </div>
  );
}
