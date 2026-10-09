import { z } from "zod";

const httpsUrl = z.string().url().refine((value) => {
  const url = new URL(value);
  return url.protocol === "https:" && !url.username && !url.password && !url.port;
}, "Expected a public HTTPS URL");
const timestamp = z.iso.datetime({ offset: true });
const expectedPublishers = ["synty", "kenney", "quaternius", "naturemanufacture", "polyperfect", "kaykit", "infinity-pbr", "craftpix", "ansimuz", "pixel-frog"];
const publisherSchema = z.object({
  id: z.string().regex(/^[a-z0-9-]+$/), name: z.string().min(2), initials: z.string().min(1).max(4), specialty: z.string().min(3), summary: z.string().min(20),
  aliases: z.array(z.string().min(2)).min(1), officialUrl: httpsUrl, catalogUrl: httpsUrl, evidenceUrl: httpsUrl, licenseNote: z.string().min(20),
  watch: z.object({ url: httpsUrl, mode: z.enum(["public_index", "permission_review"]), note: z.string().min(20) }).strict(), profileCheckedAt: timestamp,
}).strict();

export function validatePublishers(input: unknown, now = Date.now()) {
  const publishers = z.array(publisherSchema).length(10).parse(input);
  if (new Set(publishers.map((item) => item.id)).size !== 10 || expectedPublishers.some((id) => !publishers.some((item) => item.id === id))) throw new Error("Expected all ten featured publisher identities exactly once");
  const aliases = new Map<string, string>();
  for (const publisher of publishers) {
    if (Date.parse(publisher.profileCheckedAt) > now) throw new Error(`Future publisher verification: ${publisher.id}`);
    if (new URL(publisher.watch.url).host !== new URL(publisher.catalogUrl).host) throw new Error(`Watch index does not match official catalog: ${publisher.id}`);
    for (const alias of publisher.aliases) {
      const key = alias.trim().toLowerCase();
      if (aliases.has(key) && aliases.get(key) !== publisher.id) throw new Error(`Duplicate publisher alias: ${alias}`);
      aliases.set(key, publisher.id);
    }
  }
  return publishers;
}

export function validateEngineFormats(input: unknown) {
  const rules = z.array(z.object({ engine: z.enum(["Unity", "Unreal", "Godot", "GameMaker"]), kind: z.enum(["image", "model", "audio"]), formats: z.array(z.string().regex(/^[A-Z0-9]+$/)).min(1), documentationUrl: httpsUrl }).strict()).min(1).parse(input);
  const origins: Record<string, string> = { Unity: "docs.unity3d.com", Unreal: "dev.epicgames.com", Godot: "docs.godotengine.org", GameMaker: "manual.gamemaker.io" };
  const keys = new Set<string>();
  for (const rule of rules) {
    const key = `${rule.engine}:${rule.kind}`;
    if (keys.has(key) || new Set(rule.formats).size !== rule.formats.length || new URL(rule.documentationUrl).host !== origins[rule.engine]) throw new Error(`Invalid or duplicate engine evidence: ${key}`);
    keys.add(key);
  }
  return rules;
}

export function validatePublisherMonitor(input: unknown, publishers: ReturnType<typeof validatePublishers>, now = Date.now()) {
  const journal = z.object({ generatedAt: timestamp, checks: z.array(z.object({ id: z.string(), url: httpsUrl, status: z.enum(["checked", "permission_review", "blocked"]), attemptedAt: timestamp, checkedAt: timestamp.nullable(), httpStatus: z.number().int().nullable(), fingerprint: z.string().regex(/^[a-f0-9]{64}$/).nullable(), productUrls: z.array(httpsUrl).max(150), changed: z.boolean(), note: z.string().min(10) }).strict()).length(10) }).strict().parse(input);
  if (Date.parse(journal.generatedAt) > now || new Set(journal.checks.map((check) => check.id)).size !== 10) throw new Error("Invalid publisher journal date or duplicate identity");
  for (const check of journal.checks) {
    const publisher = publishers.find((item) => item.id === check.id);
    if (!publisher || check.url !== publisher.watch.url || Date.parse(check.attemptedAt) > Date.parse(journal.generatedAt) || check.checkedAt && Date.parse(check.checkedAt) > Date.parse(journal.generatedAt)) throw new Error(`Invalid publisher check provenance: ${check.id}`);
    if (check.status === "checked" && (publisher.watch.mode !== "public_index" || !check.checkedAt || check.httpStatus !== 200 || !check.fingerprint || Date.parse(check.checkedAt) < Date.parse(check.attemptedAt))) throw new Error(`Unsupported successful check: ${check.id}`);
    if (check.status === "permission_review" && publisher.watch.mode !== "permission_review" || check.status !== "checked" && check.changed) throw new Error(`Invalid publisher check status: ${check.id}`);
  }
  return journal;
}
