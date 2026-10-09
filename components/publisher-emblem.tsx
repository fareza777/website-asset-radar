import type { ReactNode } from "react";

// Original editorial illustrations of catalog specialties, not publisher logos.
// Kept as server-rendered SVG so no images or animation library need loading.
const artwork: Record<string, ReactNode> = {
  synty: (
    <>
      <path d="m13 54 17-32 13 25 10-18 15 25-27 10Z" fill="#527b67" />
      <path d="m30 22 3 33-20-1Z" fill="#b6d6bf" />
      <path d="m30 22 13 25-10 8Z" fill="#7fa68c" />
      <path d="m53 29 3 29-15 6Z" fill="#97b89e" />
      <path d="m53 29 15 25-12 4Z" fill="#355a49" />
      <path d="m27 45 14-8 14 8-14 8Z" fill="#d2bc8d" />
      <path d="m27 45 14 8v12l-14-8Z" fill="#85a58e" />
      <path d="m41 53 14-8v12l-14 8Z" fill="#486c56" />
      <path d="m27 45 14-18 14 18-14-8Z" fill="#dae7cc" />
      <path d="m41 27 14 18-14-8Z" fill="#a59065" />
      <path d="m34 52 5 3v8l-5-3Z" fill="#244535" />
    </>
  ),
  kenney: (
    <>
      <path d="m17 42 13-8 13 8-13 8Z" fill="#d0e7cb" />
      <path d="m17 42 13 8v15l-13-8Z" fill="#8ab698" />
      <path d="m30 50 13-8v15l-13 8Z" fill="#446e57" />
      <path d="m38 41 13-8 13 8-13 8Z" fill="#dfc796" />
      <path d="m38 41 13 8v15l-13-8Z" fill="#b29a6e" />
      <path d="m51 49 13-8v15l-13 8Z" fill="#786a48" />
      <path d="m26 26 14-8 14 8-14 8Z" fill="#daf0da" />
      <path d="m26 26 14 8v18l-14-8Z" fill="#8eb69a" />
      <path d="m40 34 14-8v18l-14 8Z" fill="#4c775f" />
      <path
        d="m30 35 6 3m-3-6v8"
        stroke="#1c3d2b"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <path d="m45 36 3-2v3l-3 2Zm4 4 3-2v3l-3 2Z" fill="#cce7d2" />
      <path
        d="m21 52 5 3m29-2 5-3"
        stroke="#e3efdf"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </>
  ),
  quaternius: (
    <>
      <path d="m25 41 13-7 14 7 3 18-17 8-17-9Z" fill="#668b75" />
      <path d="m25 41 13 7v19l-17-9Z" fill="#aac3aa" />
      <path d="m38 48 14-7 3 18-17 8Z" fill="#476a55" />
      <path d="m26 20 12-7 13 8v14l-13 9-12-8Z" fill="#d4e4cd" />
      <path d="m38 13 13 8v14l-13 9Z" fill="#8caa90" />
      <path d="m29 26 9 5 10-6v7l-10 6-9-5Z" fill="#264638" />
      <path d="M37 30h3v8h-3Z" fill="#c9dbc5" />
      <path d="m33 17 4-8 8 3-7 2v5Z" fill="#d3b983" />
      <path d="m49 42 14 2-2 16-10 8-7-14Z" fill="#cbb789" />
      <path d="m49 42 2 26-7-14Z" fill="#8b805d" />
      <path d="m54 48 3 1-1 10-4 3Z" fill="#f0ddae" />
      <path d="m13 32 4-4 4 25-4 2Z" fill="#dbe8d4" />
      <path
        d="m11 51 14-3m-8 5 2 10"
        stroke="#b49a68"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </>
  ),
  naturemanufacture: (
    <>
      <path d="m34 38 9-2v28l-9 4Z" fill="#9b8560" />
      <path d="m39 39 4-3v28l-4 2Z" fill="#6a6347" />
      <path d="m15 43 23-28 23 28-22 12Z" fill="#588169" />
      <path d="m38 15 1 40-24-12Z" fill="#97b79a" />
      <path d="m20 33 18-24 19 24-18 10Z" fill="#83a888" />
      <path d="m38 9 1 34-19-10Z" fill="#c3d9b8" />
      <path d="m47 56 10-8 10 9-4 8-15-1Z" fill="#8b9d89" />
      <path d="m57 48 3 11-13-3Z" fill="#c2ccaf" />
      <path d="m60 59 7-2-4 8-5-1Z" fill="#506450" />
      <path d="m16 59 8-4 4 9-9 3Z" fill="#7da084" />
    </>
  ),
  polyperfect: (
    <>
      <path d="m17 17 19 10-17 18Zm45 0-2 28-17-18Z" fill="#cbb68a" />
      <path d="m21 23 10 8-10 8Zm37 0-10 8 10 8Z" fill="#625c43" />
      <path d="m19 34 21-14 21 14 4 17-25 17-25-17Z" fill="#a9c5a9" />
      <path d="m40 20 21 14-4 19-17 15Z" fill="#6f997d" />
      <path d="m19 34 21 9-11 10-14-2Z" fill="#cbdcc1" />
      <path d="m61 34-21 9 11 10 14-2Z" fill="#99ba9d" />
      <path d="m29 53 11-10 11 10-11 15Z" fill="#e4e7ca" />
      <path d="m34 54 6-3 6 3-6 6Z" fill="#294637" />
      <path
        d="m25 40 5 2m20 0 5-2"
        stroke="#233f32"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <path
        d="M40 60v4"
        stroke="#597360"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </>
  ),
  kaykit: (
    <>
      <path d="m20 40 19-11 22 12-21 12Z" fill="#c6d6b8" />
      <path d="m20 40 20 13v14L20 55Z" fill="#9db693" />
      <path d="m40 53 21-12v14L40 67Z" fill="#617f62" />
      <path d="M18 34h13v24l-6 4-7-4Z" fill="#c3d3b2" />
      <path d="m16 34 9-17 9 17Z" fill="#a7c7a9" />
      <path d="m25 17 9 17h-9Z" fill="#668d70" />
      <path d="M50 34h13v24l-6 4-7-4Z" fill="#93ae90" />
      <path d="m48 34 9-17 9 17Z" fill="#cbb387" />
      <path d="m57 17 9 17h-9Z" fill="#9b835c" />
      <path d="m30 37 4-2v5l6 3 5-3v-5l5 3v14L40 59l-10-7Z" fill="#d7dfc0" />
      <path d="m40 43 10-5v14l-10 7Z" fill="#8ba583" />
      <path d="m36 51 4-2 4 2v10l-4 3-4-3Z" fill="#416347" />
      <path d="M24 41h3v6h-3Zm31 0h3v6h-3Z" fill="#46664c" />
      <path
        d="M40 20v11m0-11 9 3-9 3"
        stroke="#d8c18d"
        strokeWidth="2"
        strokeLinejoin="round"
      />
    </>
  ),
  "infinity-pbr": (
    <>
      <circle
        cx="40"
        cy="37"
        r="22"
        fill="#385c4a"
        stroke="#8ba586"
        strokeWidth="1.2"
      />
      <path d="M40 15a22 22 0 0 0 0 44c-12-8-14-31 0-44Z" fill="#84a68b" />
      <path d="M40 15c14 6 19 24 8 38 17-7 21-29-8-38Z" fill="#4f7860" />
      <path d="m40 23 10 14-10 16-10-16Z" fill="#cbe2c5" />
      <path d="m40 23 10 14-10 16Z" fill="#82b594" />
      <path d="m30 37 10 3 10-3" stroke="#f0f4d9" strokeWidth="1" />
      <ellipse
        cx="40"
        cy="39"
        rx="31"
        ry="10"
        transform="rotate(-27 40 39)"
        stroke="#c9b183"
        strokeWidth="1.7"
      />
      <path
        d="m62 13 1.5 4.5L68 19l-4.5 1.5L62 25l-1.5-4.5L56 19l4.5-1.5ZM17 55l1 3 3 1-3 1-1 3-1-3-3-1 3-1Z"
        fill="#ead7a7"
      />
      <circle cx="19" cy="24" r="1.5" fill="#cae4cc" />
    </>
  ),
  craftpix: (
    <>
      <rect
        x="14"
        y="19"
        width="51"
        height="42"
        rx="4"
        fill="#344f41"
        stroke="#92b195"
        strokeWidth="1.5"
      />
      <path d="M15 29h49" stroke="#92b195" strokeWidth="1" />
      <path d="M20 23h3v3h-3Zm6 0h3v3h-3Zm6 0h3v3h-3Z" fill="#c9b689" />
      <path d="M21 36h4v4h-4Zm0 8h4v4h-4Zm0 8h4v4h-4Z" fill="#7faa8d" />
      <path d="m43 33 12 10-12 13-12-13Z" fill="#a9caaa" />
      <path d="m43 33 12 10H31Z" fill="#d1e3c8" />
      <path d="m43 33 4 10-4 13-4-13Z" fill="#82af8f" />
      <path d="m61 38 5 4-18 22-6 3 2-7Z" fill="#c8ad7e" />
      <path d="m61 38 5 4-3 4-5-4Z" fill="#e1d0a4" />
      <path d="m44 60 4 4-6 3Z" fill="#e5e6cb" />
      <path d="m60 43-13 17" stroke="#7e704d" strokeWidth="1.2" />
    </>
  ),
  ansimuz: (
    <>
      <path d="M13 22h54v36l-27 10-27-10Z" fill="#294b3f" />
      <path d="M13 22h54v28H13Z" fill="#749987" />
      <path d="M44 26h12v3h3v10h-3v3H44v-3h-3V29h3Z" fill="#dfc899" />
      <path d="M13 44h5v-6h6v-5h6v5h6v6h7v7H13Z" fill="#bed2b2" />
      <path d="M34 48h6v-6h6v-4h6v4h5v5h6v-6h4v14H34Z" fill="#4b785c" />
      <path d="M13 51h54v7l-27 10-27-10Z" fill="#567e68" />
      <path d="M13 58h27v10l-27-10Z" fill="#3f6450" />
      <path d="M19 53h11v2H19Zm26 4h14v2H45Zm-14 5h8v2h-8Z" fill="#a9c6a9" />
      <path d="M19 26h9v2h-9Zm-3 2h16v2H16Z" fill="#c1d4b9" />
    </>
  ),
  "pixel-frog": (
    <>
      <path d="m17 60 23-9 23 9-23 9Z" fill="#618562" />
      <path
        d="M22 19h12v5h12v-5h12v5h5v26h-6v7H23v-7h-6V24h5Z"
        fill="#84b18a"
      />
      <path d="M22 19h12v5H22Zm24 0h12v5H46ZM17 24h5v21h-5Z" fill="#c6dfb8" />
      <path d="M58 24h5v26h-6v7H23v-5h30v-7h5Z" fill="#517c55" />
      <path d="M23 26h10v10H23Zm24 0h10v10H47Z" fill="#e5ead0" />
      <path d="M28 28h5v6h-5Zm19 0h5v6h-5Z" fill="#26402e" />
      <path d="M26 43h5v4h18v-4h5v7H26Z" fill="#355b3c" />
      <path d="M20 55h13v6H17v-3h3Zm27 0h13v3h3v3H47Z" fill="#acd09e" />
      <path d="M23 39h5v3h-5Zm29 0h5v3h-5Z" fill="#d2ba87" />
    </>
  ),
};

export function PublisherEmblem({
  publisherId,
  profile = false,
}: {
  publisherId: string;
  profile?: boolean;
}) {
  return (
    <span
      className={`publisher-emblem${profile ? " profile-emblem" : ""}`}
      aria-hidden="true"
    >
      <svg viewBox="0 0 80 80" fill="none" focusable="false">
        <path
          d="m7 42 33-19 33 19-33 19Z"
          stroke="#6f997c"
          strokeOpacity=".12"
        />
        <g className="publisher-emblem-ground">
          <ellipse
            cx="40"
            cy="66"
            rx="27"
            ry="7"
            fill="#091a10"
            fillOpacity=".5"
          />
          <path d="m11 62 29-14 29 14-29 14Z" fill="#3e5e48" />
          <path d="m11 62 29 14v3L11 65Z" fill="#253f2e" />
          <path d="m40 76 29-14v3L40 79Z" fill="#1c3426" />
          <path
            d="m11 62 29-14 29 14"
            stroke="#89af8e"
            strokeOpacity=".35"
            strokeWidth=".75"
          />
        </g>
        <g className="publisher-emblem-art" strokeLinejoin="round">
          {artwork[publisherId]}
        </g>
      </svg>
    </span>
  );
}
