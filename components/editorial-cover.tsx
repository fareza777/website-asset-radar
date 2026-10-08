"use client";

import { useId } from "react";
import type { Promotion } from "@/lib/types";

function Pine({ x, y, scale = 1 }: { x: number; y: number; scale?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`}>
      <ellipse cy="8" rx="34" ry="10" fill="#0c2425" opacity=".45" />
      <path d="M-5 5V-67H5V5" fill="#856f55" />
      <path d="M0-131L-35-65H-23L-46-27H46L23-65H35Z" fill="#427970" />
      <path d="M0-131V-27H46L23-65H35Z" fill="#2f5959" />
      <path d="M0-131L-35-65H0Z" fill="#74a28a" />
    </g>
  );
}
function Cloud({ x, y, scale = 1 }: { x: number; y: number; scale?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`} opacity=".2">
      <g className="scene-cloud">
        <path
          d="M0 14C-16 14-17-4 0-6C3-29 41-28 44-7C65-12 76 12 57 16Z"
          fill="#d9e8d8"
        />
      </g>
    </g>
  );
}

function Woodland({ village, id }: { village: boolean; id: string }) {
  return (
    <>
      <defs>
        <linearGradient id={`${id}-sky`} x2="0" y2="1">
          <stop stopColor={village ? "#202d42" : "#192e35"} />
          <stop offset="1" stopColor="#537d75" />
        </linearGradient>
        <linearGradient id={`${id}-ground`} x2="0" y2="1">
          <stop stopColor="#405c50" />
          <stop offset="1" stopColor="#172d2b" />
        </linearGradient>
      </defs>
      <path fill={`url(#${id}-sky)`} d="M0 0H800V450H0Z" />
      <circle
        cx={village ? 585 : 565}
        cy="97"
        r="31"
        fill="#e4e5c4"
        opacity=".9"
      />
      <path
        d="M0 255L103 159L221 226L354 133L512 238L656 159L800 244V450H0Z"
        fill="#355b59"
      />
      <path
        d="M0 290L145 224L281 267L470 219L619 265L800 205V450H0Z"
        fill="#294b48"
      />
      <Cloud x={170} y={90} />
      <Cloud x={610} y={156} scale={1.6} />
      <path
        d="M0 340Q178 273 367 325T800 300V450H0Z"
        fill={`url(#${id}-ground)`}
      />
      <path
        d="M459 302Q409 336 482 360Q538 379 515 450H334Q451 405 413 376Q329 324 428 302Z"
        fill="#a29673"
        opacity=".6"
      />
      <Pine x={114} y={336} scale={0.85} />
      <Pine x={685} y={338} scale={0.9} />
      <Pine x={212} y={329} scale={0.6} />
      <Pine x={608} y={296} scale={0.6} />
      {village ? (
        <g transform="translate(339 207)">
          <path d="M9 50H117V122H9Z" fill="#b0b091" />
          <path d="M117 50L148 32V101L117 122Z" fill="#747b69" />
          <path d="M-5 54L65-5L136 54Z" fill="#ac7159" />
          <path d="M65-5L100-25L164 31L136 54Z" fill="#7d544a" />
          <path d="M58 122V74H85V122" fill="#534c40" />
          <g className="scene-window">
            <path d="M23 71H41V92H23ZM97 71H111V92H97Z" fill="#edd3a0" />
          </g>
          <path d="M93-6V-36H107V7" fill="#626354" />
          <g className="scene-smoke" fill="#dbdfc8" opacity=".35">
            <circle cx="100" cy="-51" r="8" />
            <circle cx="106" cy="-67" r="12" />
          </g>
          <path
            d="M21 77H38M100 71V91M29 71V91"
            stroke="#747363"
            strokeWidth="3"
          />
        </g>
      ) : (
        <>
          <path d="M400 324L455 307L495 337L451 359L412 352Z" fill="#889287" />
          <path d="M400 324L451 338L495 337L451 359L412 352Z" fill="#61756a" />
          <path d="M516 332L552 307L577 337L552 351Z" fill="#566f65" />
          <path d="M354 351L383 328L405 354L378 367Z" fill="#9daa8b" />
          <g className="scene-fireflies" fill="#d6e6a2">
            <circle cx="362" cy="300" r="2.5" />
            <circle cx="510" cy="285" r="2" />
            <circle cx="546" cy="362" r="2.5" />
            <circle cx="310" cy="366" r="2" />
          </g>
        </>
      )}
      <Pine x={53} y={461} scale={1.7} />
      <Pine x={745} y={471} scale={1.6} />
      <path
        d="M120 450Q142 416 161 437Q172 410 192 450M643 450Q661 420 676 438Q685 407 707 450"
        fill="#14332f"
      />
    </>
  );
}

function Island({ farm, id }: { farm: boolean; id: string }) {
  return (
    <>
      <defs>
        <linearGradient id={`${id}-sky`} x2="0" y2="1">
          <stop stopColor="#1c3034" />
          <stop offset="1" stopColor="#355a58" />
        </linearGradient>
      </defs>
      <path fill={`url(#${id}-sky)`} d="M0 0H800V450H0Z" />
      <path
        d="M0 326L150 194L290 274L420 184L578 271L701 198L800 249V450H0Z"
        fill="#274547"
        opacity=".7"
      />
      <Cloud x={163} y={80} scale={1.5} />
      <Cloud x={612} y={113} />
      <ellipse
        cx="399"
        cy="403"
        rx="200"
        ry="20"
        fill="#122e31"
        opacity=".55"
      />
      <g className="scene-island">
        <path d="M120 259L402 117L688 261L402 405Z" fill="#668779" />
        <path d="M120 259L402 405V432L120 286Z" fill="#375c50" />
        <path d="M402 405L688 261V286L402 432Z" fill="#244941" />
        {farm ? (
          <>
            <path d="M222 290L333 234L436 286L325 342Z" fill="#647253" />
            {[0, 1, 2, 3, 4].map((row) => (
              <g key={row} transform={`translate(${row * 17} ${row * 8.5})`}>
                <path d="M232 285L324 239" stroke="#354e39" strokeWidth="10" />
                {[0, 1, 2, 3, 4, 5].map((col) => (
                  <g
                    key={col}
                    transform={`translate(${239 + col * 14} ${281 - col * 7})`}
                    fill="#a7bc75"
                  >
                    <path d="M0 0V-12L-6-17V-8ZM0-7L6-15V-5Z" />
                  </g>
                ))}
              </g>
            ))}
            <g transform="translate(412 152)">
              <path d="M-1 42L59 12L122 44L61 74Z" fill="#ab7159" />
              <path d="M-1 42V110L61 142V74Z" fill="#c89473" />
              <path d="M61 74L122 44V112L61 142Z" fill="#895d4e" />
              <path d="M-15 45L17-10L76 21L61 83Z" fill="#d1c2a0" />
              <path d="M17-10L79-39L138 5L76 21Z" fill="#ab9878" />
              <path d="M76 21L138 5L122 49L61 83Z" fill="#716e59" />
              <path d="M17 82L39 93V130L17 119Z" fill="#615745" />
              <path
                d="M81 83L102 73V96L81 106Z"
                fill="#e3c68c"
                className="scene-window"
              />
            </g>
            <g transform="translate(536 247)">
              <path d="M0 0L26-13V38L0 51Z" fill="#829785" />
              <path d="M-25-13L0 0V51L-25 38Z" fill="#a4b29b" />
              <path d="M-25-13L0-26L26-13L0 0Z" fill="#d0d3b4" />
              <path d="M-31-13L0-43L32-13L0 3Z" fill="#6a7f72" />
            </g>
            <Pine x={215} y={241} scale={0.58} />
            <Pine x={559} y={207} scale={0.62} />
          </>
        ) : (
          <>
            <path d="M242 197L313 161L572 301L501 337Z" fill="#428b93" />
            <path
              d="M243 220L493 351"
              stroke="#79b2ad"
              strokeWidth="2"
              opacity=".5"
              className="scene-water"
            />
            <path
              d="M284 191L530 322"
              stroke="#aed3c0"
              strokeWidth="2"
              opacity=".4"
              className="scene-water scene-water-second"
            />
            <g transform="translate(275 230)">
              <path d="M0 15L60-16L224 73L164 104Z" fill="#b29f7e" />
              <path d="M0 15V42L164 131V104Z" fill="#827457" />
              <path d="M164 104L224 73V100L164 131Z" fill="#6c715b" />
              <path
                d="M48 42V80M118 82V119M194 93V122"
                stroke="#d0c1a0"
                strokeWidth="15"
              />
              <path
                d="M0-9L164 80M60-39L224 50"
                stroke="#d4c4a4"
                strokeWidth="5"
              />
              {[0, 1, 2, 3, 4, 5].map((i) => (
                <path
                  key={i}
                  d={`M${i * 32} ${-9 + i * 17}V${15 + i * 17}M${60 + i * 32} ${-39 + i * 17}V${-16 + i * 17}`}
                  stroke="#a9a184"
                  strokeWidth="5"
                />
              ))}
            </g>
            <Pine x={203} y={252} scale={0.86} />
            <Pine x={381} y={203} scale={0.6} />
            <Pine x={607} y={278} scale={0.83} />
            <Pine x={536} y={222} scale={0.55} />
            <path d="M332 325L367 305L396 334L362 352Z" fill="#92a598" />
            <path d="M573 344L602 326L623 345L597 360Z" fill="#aab59e" />
          </>
        )}
      </g>
    </>
  );
}

function AudioStudio({ id }: { id: string }) {
  return (
    <>
      <defs>
        <linearGradient id={`${id}-sky`} x2="0" y2="1">
          <stop stopColor="#1d2a38" />
          <stop offset="1" stopColor="#34554b" />
        </linearGradient>
      </defs>
      <path fill={`url(#${id}-sky)`} d="M0 0H800V450H0Z" />
      <circle cx="591" cy="164" r="95" fill="#5f8873" opacity=".12" />
      <path d="M96 335H704" stroke="#aac3a5" strokeOpacity=".2" />
      <g transform="translate(220 112)">
        <rect
          width="360"
          height="192"
          rx="13"
          fill="#202d2c"
          stroke="#688774"
          strokeWidth="2"
        />
        <rect x="17" y="16" width="326" height="80" rx="7" fill="#16231f" />
        <path
          d="M45 70H60L75 40L91 70L105 51L121 77L142 32L166 71L190 47L214 73L234 41L256 66L278 51L305 61"
          stroke="#a9d6aa"
          fill="none"
          strokeWidth="3"
        />
        <rect x="95" y="112" width="173" height="47" rx="7" fill="#839984" />
        <g className="scene-reel">
          <circle cx="120" cy="135" r="15" fill="#2b4233" />
          <path d="M108 135H132M120 123V147" stroke="#cad0ad" strokeWidth="3" />
        </g>
        <g className="scene-reel">
          <circle cx="241" cy="135" r="15" fill="#2b4233" />
          <path d="M229 135H253M241 123V147" stroke="#cad0ad" strokeWidth="3" />
        </g>
        <path d="M139 143H222L211 154H150Z" fill="#435d45" />
        <circle cx="47" cy="135" r="20" fill="#879d86" />
        <circle cx="47" cy="135" r="13" fill="#324c3b" />
        <path d="M47 124V132" stroke="#dae0bb" strokeWidth="3" />
        <circle cx="312" cy="135" r="20" fill="#879d86" />
        <circle cx="312" cy="135" r="13" fill="#324c3b" />
        <path d="M312 124V132" stroke="#dae0bb" strokeWidth="3" />
      </g>
      <g fill="#a5c599" opacity=".6">
        {[38, 73, 52, 96, 68, 44, 83, 59, 31, 73, 95, 57, 39, 63, 45, 85].map(
          (height, i) => (
            <rect
              key={i}
              x={184 + i * 28}
              y={336 - height / 3}
              width="10"
              height={height / 3}
              rx="2"
              className={`scene-meter meter-${i % 4}`}
            />
          ),
        )}
      </g>
      <g fill="#c5d1ba" opacity=".65" fontFamily="monospace" fontSize="16">
        <text x="93" y="112">
          STEREO
        </text>
        <text x="627" y="275">
          VOL. 01
        </text>
      </g>
    </>
  );
}

function Interior({ id }: { id: string }) {
  return (
    <>
      <defs>
        <linearGradient id={`${id}-sky`} x2="0" y2="1">
          <stop stopColor="#292e31" />
          <stop offset="1" stopColor="#4c655b" />
        </linearGradient>
      </defs>
      <path fill={`url(#${id}-sky)`} d="M0 0H800V450H0Z" />
      <g transform="translate(400 250)">
        <path d="M-242 51L0-74L242 51L0 176Z" fill="#85917b" />
        <path d="M-242 51V-104L0-228V-74Z" fill="#a2a58d" />
        <path d="M0-228L242-103V51L0-74Z" fill="#6d8072" />
        <path d="M-218-81L-182-99V-37L-218-19Z" fill="#314a46" />
        <path d="M-213-77L-188-90V-45L-213-33Z" fill="#96bab2" />
        <path d="M-200-84V-39" stroke="#607c6e" strokeWidth="4" />
        <path d="M31-156L101-120V-27L31-63Z" fill="#aaa48a" />
        <path d="M41-146L91-120V-87L41-113Z" fill="#394c3d" />
        <path d="M41-103L91-77V-45L41-70Z" fill="#394c3d" />
        <path
          d="M48-129L48-113M61-124L61-106M76-116L76-98M49-89L49-70M63-81L63-63M80-74L80-55"
          stroke="#c2b795"
          strokeWidth="7"
        />
        <path
          d="M-98 54L-4 6L101 61L8 110Z"
          fill="#596d57"
          stroke="#a3ad88"
          strokeWidth="2"
        />
        <g transform="translate(-90 5)">
          <path d="M0-36L61-66L139-25L79 6Z" fill="#bbab87" />
          <path d="M0-36V-20L79 21V6Z" fill="#8c7958" />
          <path d="M79 6L139-25V-8L79 21Z" fill="#736747" />
          <path
            d="M10-18V21M125-6V35M79 21V60"
            stroke="#9a8d6b"
            strokeWidth="10"
          />
        </g>
        <g className="scene-window">
          <path d="M-28-49L-15-55L-3-49L-15-43Z" fill="#eccf96" />
          <path d="M-15-55V-68" stroke="#e3c17d" strokeWidth="5" />
          <path d="M-15-70Q-21-76-15-81Q-9-76-15-70" fill="#f4dfa9" />
        </g>
        <path d="M146-1V-86L189-65V22Z" fill="#415945" />
        <path d="M140-87L164-104L196-61L178-51Z" fill="#9ba88c" />
        <path d="M164-104L172-126L204-94L196-61Z" fill="#b3b99b" />
      </g>
    </>
  );
}

function Castle({ id }: { id: string }) {
  return (
    <>
      <defs>
        <linearGradient id={`${id}-sky`} x2="0" y2="1">
          <stop stopColor="#283343" />
          <stop offset="1" stopColor="#5b796d" />
        </linearGradient>
      </defs>
      <path fill={`url(#${id}-sky)`} d="M0 0H800V450H0Z" />
      <circle cx="563" cy="99" r="33" fill="#dce1bc" />
      <Cloud x={154} y={95} scale={1.5} />
      <Cloud x={622} y={141} />
      <path
        d="M0 315L162 212L300 299L423 193L592 287L800 235V450H0Z"
        fill="#3a5c55"
      />
      <path d="M131 363L369 279L640 355L399 415Z" fill="#263e37" />
      <g transform="translate(236 130)">
        <path d="M25 155H279V215H25Z" fill="#82917c" />
        <path d="M25 155L72 134H291L279 155Z" fill="#a8b195" />
        <path d="M25 215V27H91V215M216 215V27H282V215" fill="#91a28e" />
        <path
          d="M91 27L111 17V204L91 215M282 27L305 17V202L282 215"
          fill="#5d796a"
        />
        <path
          d="M14 31V11H30V22H45V11H61V22H76V11H95V31M205 31V11H224V22H239V11H255V22H269V11H291V31"
          fill="#bdc4a7"
        />
        <path d="M91 111H216V138H91Z" fill="#b4bea1" />
        <path d="M91 117H216" stroke="#6c8673" strokeWidth="2" />
        <path d="M128 215V175Q152 143 176 175V215" fill="#2b4239" />
        <path d="M138 215V179Q152 161 167 179V215" fill="#425848" />
        <path d="M152 171V215" stroke="#273f34" strokeWidth="3" />
        <path
          d="M50 75V57Q59 44 68 57V75M241 75V57Q249 44 258 57V75"
          fill="#d6c88e"
          className="scene-window"
        />
        <path
          d="M49 138H72M237 143H268M24 174H41M265 103H282"
          stroke="#688674"
          strokeWidth="3"
        />
        <path d="M150 112V66L196 79L150 87" fill="#b3c799" />
        <path d="M150 64V113" stroke="#58745f" strokeWidth="4" />
      </g>
      <path d="M366 345L435 345L502 450H292Z" fill="#84947d" />
      <Pine x={94} y={409} scale={1.4} />
      <Pine x={714} y={421} scale={1.5} />
    </>
  );
}

function Pathfinding({ id }: { id: string }) {
  return (
    <>
      <defs>
        <linearGradient id={`${id}-sky`} x2="0" y2="1">
          <stop stopColor="#1e3036" />
          <stop offset="1" stopColor="#314e4b" />
        </linearGradient>
        <pattern
          id={`${id}-grid`}
          width="60"
          height="60"
          patternUnits="userSpaceOnUse"
        >
          <path
            d="M60 0H0V60"
            fill="none"
            stroke="#9dd1b0"
            strokeOpacity=".18"
          />
        </pattern>
      </defs>
      <path fill={`url(#${id}-sky)`} d="M0 0H800V450H0Z" />
      <g transform="translate(403 254) rotate(-26) skewX(30) scale(1 .8)">
        <rect
          x="-240"
          y="-180"
          width="480"
          height="360"
          rx="4"
          fill="#253d39"
          stroke="#7aa38a"
          strokeOpacity=".4"
        />
        <rect
          x="-240"
          y="-180"
          width="480"
          height="360"
          fill={`url(#${id}-grid)`}
        />
        <path
          d="M-120-120H0V-60H-120ZM0 0H120V60H0Z"
          fill="#4f6a5b"
          stroke="#7a9980"
        />
        <path d="M-120-120V-154H0V-120M0 0V-35H120V0" fill="#788c76" />
        <path
          d="M0-154L18-143V-49L0-60ZM120-35L138-24V71L120 60Z"
          fill="#334f48"
        />
        <path
          d="M-210 150V-30H-150V-150H30V-90H150V90H210V150"
          fill="none"
          stroke="#658f78"
          strokeWidth="3"
          strokeDasharray="4 9"
        />
        <path
          d="M-210 150V-30H-150V-150H30V-90H150V90H210V150"
          fill="none"
          stroke="#b5f0cf"
          strokeWidth="4"
          strokeDasharray="16 840"
          className="scene-route"
        />
        <g fill="#b5f0cf" stroke="#203c2e" strokeWidth="5">
          <circle cx="-210" cy="150" r="10" />
          <circle cx="210" cy="150" r="10" />
        </g>
        <circle
          cx="210"
          cy="150"
          r="18"
          fill="none"
          stroke="#b5f0cf"
          className="scene-destination"
        />
      </g>
      <g stroke="#a6ceb4" strokeWidth="1" opacity=".5">
        <path d="M87 110H167M127 70V150M641 338H713M677 302V374" />
      </g>
      <g fill="#adc4b2" fontFamily="monospace" fontSize="17">
        <text x="75" y="389">
          A → B
        </text>
        <text x="627" y="86">
          NAV MESH
        </text>
      </g>
    </>
  );
}

export function EditorialCover({ asset }: { asset: Promotion }) {
  const id = useId().replaceAll(":", "");
  const tool = asset.assetType === "Tools & Plugins";
  const farm = asset.tags.includes("farm");
  const village = asset.id === "winlu-fantasy-exterior";
  const audio = asset.dimension === "Audio";
  const interior = asset.tags.includes("interior");
  const castle = asset.tags.includes("castle");
  const world = audio
    ? "Give your world a soundtrack."
    : interior
      ? "A place to call your own."
      : castle
        ? "Every world needs a story."
        : tool
          ? "Find a way through."
          : farm
            ? "A quieter kind of world."
            : village
              ? "Build your next adventure."
              : asset.dimension === "3D"
                ? "Take the scenic route."
                : "Let the forest come alive.";
  return (
    <div className="editorial-cover motion-surface" data-motion="paused">
      <svg
        viewBox="0 0 800 450"
        className="editorial-scene"
        aria-hidden="true"
        focusable="false"
      >
        {audio ? (
          <AudioStudio id={id} />
        ) : interior ? (
          <Interior id={id} />
        ) : castle ? (
          <Castle id={id} />
        ) : tool ? (
          <Pathfinding id={id} />
        ) : asset.dimension === "3D" ? (
          <Island farm={farm} id={id} />
        ) : (
          <Woodland village={village} id={id} />
        )}
      </svg>
      <div className="cover-topline">
        <span>
          {asset.dimension} / {asset.assetType}
        </span>
      </div>
      <div className="cover-story">
        <strong>{world}</strong>
        <span>Editorial illustration · asset preview at source</span>
      </div>
    </div>
  );
}
