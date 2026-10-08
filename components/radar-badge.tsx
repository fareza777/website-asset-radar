import Link from "next/link";
import { Target } from "@phosphor-icons/react/dist/ssr";

export function RadarBadge({ score }: { score: number }) {
  return (
    <Link
      className="radar-badge"
      href="/about/#radar-score"
      aria-label={`Radar Score ${score} out of 100. Read how it works.`}
    >
      <Target size={15} aria-hidden="true" />
      <span>
        RADAR SCORE <strong>{score}</strong>
        <span className="sr-only"> / 100</span>
      </span>
    </Link>
  );
}
