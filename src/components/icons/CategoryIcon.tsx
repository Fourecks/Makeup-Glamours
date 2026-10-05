import { slugify } from "../../lib/routes";

/** Small, consistent outline symbols; the category name provides the accessible label. */
export default function CategoryIcon({
  category,
  className = "",
}: {
  category: string;
  className?: string;
}) {
  const name = slugify(category);
  const kind = /paleta|sombra|ojos-y/.test(name)
    ? "palette"
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
                ? "comb"
                : /rubor/.test(name)
                  ? "brush"
                  : /polvo/.test(name)
                    ? "powder"
                    : /base|corrector|primer/.test(name)
                      ? "foundation"
                      : /tinta/.test(name)
                        ? "gloss"
                        : /skincare/.test(name)
                          ? "cleanser"
                          : "cream";
  const symbols = {
    lipstick: (
      <>
        <path d="M7 13h7v8H7zM8.5 13V7l4-3v9M7 17h7M17 11h3v10h-3" />
      </>
    ),
    mascara: (
      <>
        <rect x="6" y="13" width="5" height="8" rx="1" />
        <path d="m16 19 2-14M16 4l5 1M16 7l5 1M15.5 10l5 1M8.5 13V9" />
      </>
    ),
    liner: (
      <>
        <path d="m5 19 12-12 3 3-12 12-4 1 1-4ZM15 9l3 3M17 7l1-3 4 4-2 2" />
      </>
    ),
    palette: (
      <>
        <rect x="3" y="5" width="18" height="15" rx="2" />
        <path d="M3 11h18M9 11v9M15 11v9" />
      </>
    ),
    brow: (
      <>
        <path d="M3 10c5-5 13-5 18 0M5 14c4-2 10-2 14 0M7 13l-1 3M11 12v3M15 12l1 3" />
      </>
    ),
    brush: (
      <>
        <path d="M9 11h6l-1 10h-4l-1-10ZM9 11C5 7 8 3 12 3s7 4 3 8M9 14h6" />
      </>
    ),
    powder: (
      <>
        <circle cx="12" cy="13" r="8" />
        <circle cx="12" cy="13" r="5" />
        <path d="M10 5V3h4v2" />
      </>
    ),
    foundation: (
      <>
        <rect x="6" y="9" width="12" height="12" rx="2" />
        <path d="M9 9V5h6v4M12 5V3h6v2M9 14h6" />
      </>
    ),
    perfume: (
      <>
        <rect x="5" y="9" width="14" height="12" rx="2" />
        <path d="M9 9V5h6v4M9 3h6M9 14h6" />
      </>
    ),
    comb: (
      <>
        <path d="M5 4h14v5H5zM5 9v12M8.5 9v12M12 9v12M15.5 9v12M19 9v12" />
      </>
    ),
    gloss: (
      <>
        <rect x="5" y="12" width="6" height="9" rx="1" />
        <path d="M5 12V8h6v4M17 3v13M15 16h4v4h-4z" />
      </>
    ),
    cleanser: (
      <>
        <rect x="6" y="10" width="12" height="11" rx="2" />
        <path d="M9 10V6h6v4M12 6V3h7v2M10 15h4" />
      </>
    ),
    cream: (
      <>
        <path d="m6 3 2 14h8l2-14H6ZM8 17v4h8v-4M10 8h4" />
      </>
    ),
  };
  return (
    <svg
      className={className}
      width="48"
      height="48"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.35"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {symbols[kind]}
    </svg>
  );
}
