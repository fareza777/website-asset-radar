import Link from "next/link";
import { Target } from "@phosphor-icons/react/dist/ssr";

export function RadarBadge({
  score,
  provisional = false,
}: {
  score: number;
  provisional?: boolean;
}) {
  return (
    <Link
      className="radar-badge"
      href="/about/#radar-score"
      title={
        provisional
          ? "Provisional editorial score: no marketplace ratings or in-engine testing. Read the evidence and method."
          : "Quality score based on published evidence. Price and discounts are assessed separately in Deal Score."
      }
      aria-label={`Radar Score ${score} out of 100${provisional ? ", provisional" : ""}. Read how it works.`}
    >
      <Target size={15} aria-hidden="true" />
      <span>
        RADAR SCORE <strong>{score}</strong>
        <span className="sr-only"> / 100</span>
      </span>
    </Link>
  );
}

export function DealBadge({ score }: { score: number }) {
  return <Link className="deal-score-badge" href="/about/#deal-score" aria-label={`Deal Score ${score} out of 100. Read the value scoring method.`} title="Value of the verified offer, separate from asset quality. A historical score is not a current availability claim.">Deal Score <strong>{score}</strong><span className="sr-only"> / 100</span></Link>;
}
