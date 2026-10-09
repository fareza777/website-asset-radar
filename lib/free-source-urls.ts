/** Public identities only; being allowlisted never establishes a content license. */
function publicUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === "https:" &&
      !url.username &&
      !url.password &&
      !url.port &&
      url.hostname === "opengameart.org"
      ? url
      : null;
  } catch {
    return null;
  }
}

export function isOpenGameArtProductUrl(value: string) {
  const url = publicUrl(value);
  return Boolean(
    url &&
    /^\/content\/[a-z0-9][a-z0-9-]*\/?$/.test(url.pathname) &&
    !url.search,
  );
}

export function isOpenGameArtIndexUrl(value: string) {
  const url = publicUrl(value);
  if (!url || !["/latest", "/art-search-advanced"].includes(url.pathname))
    return false;
  for (const [key, entry] of url.searchParams) {
    if (key === "page" && /^\d{1,6}$/.test(entry)) continue;
    if (url.pathname === "/latest") return false;
    if (key === "keys" && entry.length <= 100) continue;
    if (
      key === "sort_by" &&
      ["count", "created", "changed", "title"].includes(entry)
    )
      continue;
    if (key === "sort_order" && ["ASC", "DESC"].includes(entry)) continue;
    if (
      /^field_art_(type|licenses)_tid(?:\[\d*\])?$/.test(key) &&
      /^\d{1,5}$/.test(entry)
    )
      continue;
    return false;
  }
  return true;
}

export function isOpenGameArtDownloadUrl(value: string) {
  const url = publicUrl(value);
  if (
    !url ||
    url.search ||
    url.hash ||
    !url.pathname.startsWith("/sites/default/files/")
  )
    return false;
  let path: string;
  try {
    path = decodeURIComponent(
      url.pathname.slice("/sites/default/files/".length),
    );
  } catch {
    return false;
  }
  return (
    !/[\\\x00-\x1f]/.test(path) &&
    !path
      .split("/")
      .some((part) =>
        ["..", ".", "styles", "css", "js", "private"].includes(
          part.toLowerCase(),
        ),
      ) &&
    /\.(zip|png|jpg|jpeg|webp|ogg|wav|mp3)$/i.test(path)
  );
}
