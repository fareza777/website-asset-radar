import Link from "next/link";
import { ArrowUpRight } from "@/lib/icons";
import type { DirectoryAsset } from "@/lib/types";
import {
  freeScoreBreakdown,
  scoreBreakdown,
  scoreEvidenceNote,
  SCORE_FACTORS,
  DEAL_FACTORS,
  dealScoreBreakdown,
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
      {asset.type !== "free" && <div className="deal-score-breakdown">
        <h3>Deal Score {asset.dealScore} / 100</h3>
        <p className="score-evidence-note">Value of the recorded promotion: quality, usefulness for the price, verified reduction and commercial terms. Availability is checked separately.</p>
        <dl>{Object.entries(dealScoreBreakdown(asset)).map(([factor, points]) => <div key={factor}><dt>{DEAL_FACTORS[factor as keyof typeof DEAL_FACTORS].label}</dt><dd>{points} / {DEAL_FACTORS[factor as keyof typeof DEAL_FACTORS].maximum}</dd></div>)}</dl>
      </div>}
      <Link href="/about/#radar-score" className="text-link">
        Read the scoring method <ArrowUpRight size={15} />
      </Link>
    </div>
  );
}
