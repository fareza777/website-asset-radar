import { Target as RadarIcon } from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";

export function Brand({ compact = false }: { compact?: boolean }) {
  return (
    <Link href="/" className="brand" aria-label="AssetRadar home">
      <span className="brand-mark">
        <RadarIcon size={26} weight="duotone" />
      </span>
      {!compact && (
        <span>
          Asset<span className="brand-light">Radar</span>
          <span className="brand-dot">.</span>
        </span>
      )}
    </Link>
  );
}
