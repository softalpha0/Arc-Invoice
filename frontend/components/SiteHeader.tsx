import Link from "next/link";
import { Logo } from "./Logo";
import { ConnectButton } from "./ConnectButton";
import { IconArrowLeft } from "./icons";

export function SiteHeader({ back }: { back?: boolean }) {
  return (
    <header className="flex items-center justify-between">
      <div className="flex items-center gap-1">
        {back && (
          <Link
            href="/"
            aria-label="Back to dashboard"
            className="flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-surface hover:text-foreground"
          >
            <IconArrowLeft className="h-4 w-4" />
          </Link>
        )}
        <Link href="/" className="flex items-center gap-2">
          <Logo />
          <div>
            <p className="text-sm font-semibold leading-tight">Arc Invoice</p>
            <p className="text-xs text-muted-foreground leading-tight">USDC invoicing on Arc</p>
          </div>
        </Link>
      </div>
      <ConnectButton />
    </header>
  );
}
