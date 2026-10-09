import { canonicalUrl } from "../lib/catalog-utils";
export type GrowthCandidate = {
  source: string;
  sourceUrl: string;
  payload: unknown;
};
export type GrowthReport = {
  added: string[];
  failures: { sourceUrl: string; reason: string }[];
  inspected: number;
  blocked: string[];
  stopReason:
    | "addition_limit"
    | "inspection_limit"
    | "time_budget"
    | "download_budget"
    | "sources_exhausted";
};

export async function fillGrowthQueue(
  candidates: GrowthCandidate[],
  options: {
    target?: number | null;
    maxCandidates?: number | null;
    deadline: number;
    downloadBudgetReached?: () => boolean;
    importCandidate: (candidate: GrowthCandidate) => Promise<string | null>;
  },
): Promise<GrowthReport> {
  const result: GrowthReport = {
    added: [],
    failures: [],
    inspected: 0,
    blocked: [],
    stopReason: "sources_exhausted",
  };
  const additionLimit = options.target ?? Infinity;
  const inspectionLimit = options.maxCandidates ?? Infinity;
  const queues = new Map<string, GrowthCandidate[]>();
  const seen = new Set<string>();
  for (const candidate of candidates) {
    const identity = canonicalUrl(candidate.sourceUrl);
    if (seen.has(identity)) continue;
    seen.add(identity);
    const queue = queues.get(candidate.source) ?? [];
    queue.push(candidate);
    queues.set(candidate.source, queue);
  }
  const available = () => [...queues.values()].some((queue) => queue.length);
  while (
    result.added.length < additionLimit &&
    result.inspected < inspectionLimit &&
    Date.now() < options.deadline &&
    !options.downloadBudgetReached?.() &&
    available()
  ) {
    for (const [source, queue] of queues) {
      if (
        result.added.length >= additionLimit ||
        result.inspected >= inspectionLimit ||
        Date.now() >= options.deadline ||
        options.downloadBudgetReached?.()
      )
        break;
      const candidate = queue.shift();
      if (!candidate) continue;
      result.inspected++;
      try {
        const id = await options.importCandidate(candidate);
        if (id) result.added.push(id);
      } catch (error) {
        const reason = (error as Error).message;
        result.failures.push({ sourceUrl: candidate.sourceUrl, reason });
        if (
          /\b(401|403|429)\b|robots|protection|outside the allowlist|source agreement/i.test(
            reason,
          )
        ) {
          queue.length = 0;
          result.blocked.push(source);
        }
      }
    }
  }
  result.stopReason = options.downloadBudgetReached?.()
    ? "download_budget"
    : Date.now() >= options.deadline
      ? "time_budget"
      : result.added.length >= additionLimit
        ? "addition_limit"
        : result.inspected >= inspectionLimit
          ? "inspection_limit"
          : "sources_exhausted";
  return result;
}
