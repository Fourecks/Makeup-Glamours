import { slugify } from "../../lib/routes";

/** Original 64px cosmetic illustrations, drawn with a single unfilled outline. */
export default function CategoryIcon({
  category,
  className = "",
}: {
  category: string;
  className?: string;
}) {
  const name = slugify(category);
  const kind = /labios-ojos/.test(name)
    ? "multi"
    : /paleta|sombra/.test(name)
      ? "palette"
      : /cejas-y-pestanas/.test(name)
        ? "mascara"
        : /ceja/.test(name)
          ? "brow"
          : /mascara|pestana/.test(name)
            ? "mascara"
            : /delineador/.test(name)
              ? "liner"
              : /labio/.test(name)
                ? "lipstick"
                : /perfume/.test(name)
                  ? "perfume"
                  : /cabello/.test(name)
                    ? "hair"
                    : /rubor/.test(name)
                      ? "blush"
                      : /polvo/.test(name)
                        ? "powder"
                        : /corrector/.test(name)
                          ? "concealer"
                          : /primer/.test(name)
                            ? "primer"
                            : /base/.test(name)
                              ? "foundation"
                              : /tinta/.test(name)
                                ? "tint"
                                : "cream";
  const symbols = {
    lipstick: (
      <>
        <path d="M16 34h19v21H16zM16 43h19M19 34V18c0-2 1-3 3-4l9-5v25M19 22l12-7" />
        <rect x="41" y="28" width="12" height="27" rx="2" />
        <path d="M41 49h12" />
      </>
    ),
    mascara: (
      <>
        <rect x="12" y="30" width="14" height="25" rx="3" />
        <path d="M15 30v-5h8v5M12 46h14M43 11v28M38 39h10v16H38zM38 44h10M38 12h10M37 16h12M37 20h12M38 24h10" />
      </>
    ),
    liner: (
      <>
        <path d="m13 44 28-28 8 8-28 28-12 3 4-11ZM13 44l8 8M38 19l8 8M41 16l5-5a3 3 0 0 1 4 0l4 4a3 3 0 0 1 0 4l-5 5M10 54l5-5" />
      </>
    ),
    palette: (
      <>
        <rect x="8" y="13" width="48" height="40" rx="4" />
        <path d="M8 29h48M28 13v-3h8v3" />
        <rect x="14" y="18" width="36" height="6" rx="1" />
        <rect x="14" y="35" width="8" height="11" rx="1" />
        <rect x="28" y="35" width="8" height="11" rx="1" />
        <rect x="42" y="35" width="8" height="11" rx="1" />
      </>
    ),
    brow: (
      <>
        <path d="M9 25c11-13 29-14 46-5-17-4-29-1-40 10l-6-5ZM16 51l25-19 5 6-25 19-8 1 3-7ZM37 35l5 6M16 51l5 6M45 33l6-5M47 28l5 5M50 25l5 5" />
      </>
    ),
    blush: (
      <>
        <ellipse cx="26" cy="19" rx="16" ry="11" />
        <ellipse cx="26" cy="19" rx="10" ry="6" />
        <path d="M10 19v21c0 6 7 11 16 11 5 0 9-1 12-3M10 40c0-6 7-11 16-11 4 0 8 1 11 3M44 33h10l-2 22h-6l-2-22ZM44 33c-5-7-3-15 5-17 8 2 10 10 5 17M44 38h10" />
      </>
    ),
    powder: (
      <>
        <path d="M13 30c-5-6-4-15 2-20 9-7 25-7 34 0 6 5 7 14 2 20" />
        <path d="M19 25c-5-5-4-11 1-14 6-4 18-4 24 0 5 3 6 9 1 14" />
        <ellipse cx="32" cy="39" rx="23" ry="15" />
        <ellipse cx="32" cy="38" rx="16" ry="9" />
        <path d="M9 39v3c0 9 10 15 23 15s23-6 23-15v-3M29 53v4h6v-4" />
      </>
    ),
    foundation: (
      <>
        <rect x="18" y="25" width="28" height="31" rx="4" />
        <path d="M25 25V15h14v10M28 15V9h17v6h-6M24 34h16v13H24zM29 40h6" />
      </>
    ),
    concealer: (
      <>
        <rect x="13" y="27" width="15" height="29" rx="3" />
        <path d="M16 27v-6h9v6M13 47h15M44 23v20M41 43h6l-1 9c-1 3-4 3-5 0v-9Z" />
        <rect x="38" y="8" width="12" height="15" rx="2" />
      </>
    ),
    primer: (
      <>
        <path d="M19 9h26l-4 33H23L19 9ZM20 15h24M24 42v13h16V42M24 49h16M28 26h8M30 31h4" />
      </>
    ),
    perfume: (
      <>
        <rect x="12" y="25" width="40" height="31" rx="6" />
        <path d="M25 25v-7h14v7M25 18V9h14v9M29 9v9M35 9v9" />
        <rect x="22" y="34" width="20" height="14" rx="1" />
        <path d="M28 41h8" />
      </>
    ),
    hair: (
      <>
        <rect x="19" y="26" width="26" height="30" rx="5" />
        <path d="M25 26V16h14v10M27 16V9h17v7h-5M25 35h14v12H25zM49 10l5-2M49 15h7M49 20l5 2" />
      </>
    ),
    tint: (
      <>
        <rect x="12" y="31" width="20" height="25" rx="5" />
        <path d="M17 31v-7h10v7M12 44h20M46 24v18M44 42h4v8c0 3-4 3-4 0v-8Z" />
        <rect x="40" y="8" width="12" height="16" rx="2" />
      </>
    ),
    multi: (
      <>
        <path d="M15 26h18v29H15zM18 26V15a6 6 0 0 1 12 0v11M15 43h18" />
        <rect x="40" y="35" width="12" height="20" rx="2" />
        <path d="M43 35V23h6v12M43 23l3-6 3 6M40 48h12" />
      </>
    ),
    cream: (
      <>
        <path d="M16 9h32l-5 35H21L16 9ZM17 15h30M22 44v11h20V44M22 50h20M27 28c0-3 5-8 5-8s5 5 5 8a5 5 0 0 1-10 0Z" />
      </>
    ),
  };
  return (
    <svg
      className={className}
      width="64"
      height="64"
      viewBox="0 0 64 64"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {symbols[kind]}
    </svg>
  );
}
