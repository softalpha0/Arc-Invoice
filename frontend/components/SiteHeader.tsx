import Link from "next/link";
import { Logo } from "./Logo";
import { ConnectButton } from "./ConnectButton";

export function SiteHeader({ back }: { back?: boolean }) {
  return (
    <header className="flex items-center justify-between">
      <Link href="/" className="flex items-center gap-2">
        <Logo />
        <div>
          <p className="text-sm font-semibold leading-tight">
            {back ? <span className="text-muted-foreground">←</span> : null} Arc Invoice
          </p>
          <p className="text-xs text-muted-foreground leading-tight">USDC invoicing on Arc</p>
        </div>
      </Link>
      <ConnectButton />
    </header>
  );
}
