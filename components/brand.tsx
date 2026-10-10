import { Target as RadarIcon } from "@/lib/icons";
import Link from "next/link";

export function Brand({ compact = false }: { compact?: boolean }) {
  return (
    <Link href="/" className="brand" aria-label="Game Asset Radar home">
      <span className="brand-mark">
        <RadarIcon size={26} weight="duotone" />
      </span>
      {!compact && (
        <span className="brand-wordmark">
          <span className="brand-game">Game</span>{" "}
          <span className="brand-title">
            Asset <span className="brand-light">Radar</span>
            <span className="brand-dot">.</span>
          </span>
        </span>
      )}
    </Link>
  );
}
