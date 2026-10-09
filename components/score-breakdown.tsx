import Link from "next/link";
import { ArrowUpRight } from "@phosphor-icons/react/dist/ssr";
import type { DirectoryAsset } from "@/lib/types";
import {
  freeScoreBreakdown,
  scoreBreakdown,
  scoreEvidenceNote,
  SCORE_FACTORS,
} from "@/lib/radar-score";

export function RadarScoreBreakdown({ asset }: { asset: DirectoryAsset }) {
  const scores =
    asset.type === "free" ? freeScoreBreakdown(asset) : scoreBreakdown(asset);
  return (
    <div className="score-breakdown">
      <h3>Radar Score {asset.radarScore} / 100</h3>
      <p className="score-evidence-note">{scoreEvidenceNote(asset)}</p>
      <dl>
        {(Object.keys(SCORE_FACTORS) as (keyof typeof SCORE_FACTORS)[]).map(
          (factor) => (
            <div key={factor}>
              <dt>{SCORE_FACTORS[factor].label}</dt>
              <dd>
                {scores[factor]} / {SCORE_FACTORS[factor].maximum}
              </dd>
            </div>
          ),
        )}
      </dl>
      <Link href="/about/#radar-score" className="text-link">
        Read the scoring method <ArrowUpRight size={15} />
      </Link>
    </div>
  );
}
