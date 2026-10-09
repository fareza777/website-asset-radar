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
          : "Editorial score based on published evidence, separate from marketplace stars. Read the method."
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
