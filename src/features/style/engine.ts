import type { Product, CartItem } from "../../types";
export const styles = {
  natural: "Natural",
  soft_glam: "Soft Glam",
  glam: "Glam",
  bold_creative: "Creativo",
} as const;
export const occasions = {
  diario: "Todos los días",
  universidad_trabajo: "Universidad / trabajo",
  salida: "Salida",
  fiesta_evento: "Fiesta / evento",
  especial: "Algo especial",
} as const;
export const finishes = {
  natural: "Natural",
  mate: "Mate",
  luminoso: "Luminoso",
  satinado: "Satinado",
  glossy: "Glossy",
} as const;
export const roles = {
  preparacion: "Preparación",
  base: "Base",
  corrector: "Corrector",
  polvo: "Polvo",
  contorno: "Contorno",
  bronzer: "Bronzer",
  blush: "Rubor",
  iluminador: "Iluminador",
  cejas: "Cejas",
  sombras: "Sombras",
  delineador: "Delineador",
  mascara: "Máscara",
  labios: "Labios",
  fijador: "Fijador",
  skincare: "Skincare",
  accesorio: "Accesorio",
} as const;
export type Role = keyof typeof roles;
export type Group = "rostro" | "ojos" | "labios" | "cejas" | "skincare";
export interface Metadata {
  product_id?: string;
  styles: (keyof typeof styles)[];
  occasions: (keyof typeof occasions)[];
  finishes: (keyof typeof finishes)[];
  role: Role | null;
  level: "principiante" | "intermedio" | "cualquiera";
  recommendation_enabled: boolean;
  recommendation_priority: 0 | 1 | 2;
  recommendation_reviewed: boolean;
}
export interface Profile {
  style: keyof typeof styles | "";
  occasion: keyof typeof occasions;
  groups: Group[];
  finish: keyof typeof finishes | "";
  experience: "principiante" | "intermedio" | "experto";
  budget: number | null;
}
export interface Candidate {
  product: Product;
  metadata: Metadata;
  score: number;
  group: Group;
  role: Role;
}
export const emptyMetadata = (): Metadata => ({
  styles: [],
  occasions: [],
  finishes: [],
  role: null,
  level: "cualquiera",
  recommendation_enabled: false,
  recommendation_priority: 0,
  recommendation_reviewed: false,
});
const normalize = (s: string) =>
  s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
export function inferRole(category: string): Role | null {
  const c = normalize(category);
  if (/^rubor|^colorete/.test(c)) return "blush";
  if (/^labios$|^labiales$/.test(c)) return "labios";
  if (/^base/.test(c)) return "base";
  if (/^corrector/.test(c)) return "corrector";
  if (/^polvo/.test(c)) return "polvo";
  if (/^cejas$/.test(c)) return "cejas";
  if (/^mascara.*pestanas/.test(c)) return "mascara";
  if (/^paletas? de sombra|^sombras$/.test(c)) return "sombras";
  if (/^delineador/.test(c)) return "delineador";
  if (/^primer$/.test(c)) return "preparacion";
  if (/^skincare$|^cuidado facial$/.test(c)) return "skincare";
  if (/^iluminador/.test(c)) return "iluminador";
  if (/^contorno/.test(c)) return "contorno";
  if (/^bronzer/.test(c)) return "bronzer";
  if (/^fijador/.test(c)) return "fijador";
  if (/^accesorio|^brochas$/.test(c)) return "accesorio";
  return null;
}
export function groupFor(role: Role): Group {
  return role === "labios"
    ? "labios"
    : role === "cejas"
      ? "cejas"
      : role === "skincare"
        ? "skincare"
        : ["sombras", "delineador", "mascara"].includes(role)
          ? "ojos"
          : "rostro";
}
export function stock(product: Product): number {
  return product.variants?.length
    ? product.variants.reduce(
        (sum, v) => sum + Math.max(0, Number(v.stock) || 0),
        0,
      )
    : Math.max(0, Number(product.stock) || 0);
}
export function remaining(
  product: Product,
  cart: CartItem[],
  variantId: string | null,
): number {
  const quantity = cart
    .filter((i) => i.productId === product.id && i.variantId === variantId)
    .reduce((s, i) => s + i.quantity, 0);
  return Math.max(
    0,
    (variantId
      ? product.variants.find((v) => v.id === variantId)?.stock || 0
      : product.stock) - quantity,
  );
}
export function rank(
  products: Product[],
  metadata: Record<string, Metadata>,
  profile: Profile,
): Candidate[] {
  return products
    .flatMap((product) => {
      const m = metadata[product.id];
      if (
        !m?.recommendation_enabled ||
        !m.role ||
        stock(product) <= 0 ||
        !Number.isFinite(Number(product.price)) ||
        Number(product.price) <= 0
      )
        return [];
      const group = groupFor(m.role);
      if (profile.groups.length && !profile.groups.includes(group)) return [];
      if (profile.experience === "principiante" && m.level === "intermedio")
        return [];
      const score =
        (profile.style && m.styles.includes(profile.style) ? 4 : 0) +
        (m.occasions.includes(profile.occasion) ? 3 : 0) +
        (profile.finish && m.finishes.includes(profile.finish) ? 2 : 0) +
        (m.level === "cualquiera" || m.level === profile.experience ? 2 : 0) +
        (profile.groups.includes(group) ? 3 : 0) +
        m.recommendation_priority;
      return [{ product, metadata: m, role: m.role, group, score }];
    })
    .sort(
      (a, b) =>
        b.score - a.score ||
        Number(a.product.price) - Number(b.product.price) ||
        a.product.id.localeCompare(b.product.id),
    );
}
const cents = (n: number) => Math.round(Number(n) * 100);
export function budgetOptions(
  products: Product[],
  metadata: Record<string, Metadata>,
): number[] {
  const prices = products
    .filter(
      (p) =>
        metadata[p.id]?.recommendation_enabled &&
        metadata[p.id]?.role &&
        stock(p) > 0 &&
        Number(p.price) > 0,
    )
    .map((p) => Number(p.price))
    .sort((a, b) => a - b);
  if (!prices.length) return [];
  const median = prices[Math.floor(prices.length / 2)];
  return [
    ...new Set([
      Math.ceil((median * 2) / 5) * 5,
      Math.ceil((median * 4) / 5) * 5,
      Math.ceil((median * 6) / 5) * 5,
    ]),
  ];
}
function roleOrder(profile: Profile): Role[] {
  const basic: Role[] = [
    "blush",
    "mascara",
    "labios",
    "cejas",
    "corrector",
    "base",
    "sombras",
    "preparacion",
    "polvo",
    "iluminador",
    "delineador",
    "bronzer",
    "contorno",
    "fijador",
    "skincare",
    "accesorio",
  ];
  if (profile.style === "glam" || profile.style === "bold_creative")
    return [
      "labios",
      "sombras",
      "blush",
      "mascara",
      "base",
      "cejas",
      "delineador",
      ...basic.filter(
        (r) =>
          ![
            "labios",
            "sombras",
            "blush",
            "mascara",
            "base",
            "cejas",
            "delineador",
          ].includes(r),
      ),
    ];
  return basic;
}
/** Multiple-choice knapsack: one product per role. Coverage first, then useful role priority and compatibility. */
export function compose(
  products: Product[],
  metadata: Record<string, Metadata>,
  profile: Profile,
): Candidate[] {
  const candidates = rank(products, metadata, profile);
  const order = roleOrder(profile);
  const options = budgetOptions(products, metadata);
  const tier =
    profile.budget === null
      ? 2
      : profile.budget <= (options[0] || 0)
        ? 0
        : profile.budget <= (options[1] || 0)
          ? 1
          : 2;
  const maxItems =
    profile.experience === "principiante"
      ? 3
      : tier === 0
        ? 3
        : tier === 1
          ? 5
          : 7;
  const limit = profile.budget === null ? Infinity : cents(profile.budget);
  type State = { items: Candidate[]; cost: number; value: number };
  let states: State[] = [{ items: [], cost: 0, value: 0 }];
  for (const role of order) {
    const next = [...states];
    const choices = candidates.filter((c) => c.role === role);
    for (const state of states) {
      if (state.items.length >= maxItems) continue;
      for (const c of choices) {
        const cost = state.cost + cents(c.product.price);
        if (cost > limit) continue;
        const newGroup = !state.items.some((i) => i.group === c.group);
        next.push({
          items: [...state.items, c],
          cost,
          value:
            state.value +
            20 +
            c.score +
            (order.length - order.indexOf(role)) * 2 +
            (newGroup ? 35 : 0),
        });
      }
    }
    // Preserve diversity and item count while discarding dominated equivalent states.
    const best = new Map<string, State>();
    for (const s of next) {
      const key = `${s.cost}:${s.items.length}:${[...new Set(s.items.map((i) => i.group))].sort().join(",")}`;
      const old = best.get(key);
      if (!old || s.value > old.value) best.set(key, s);
    }
    states = [...best.values()];
  }
  return (
    states.sort(
      (a, b) =>
        b.value - a.value ||
        a.cost - b.cost ||
        a.items
          .map((i) => i.product.id)
          .join()
          .localeCompare(b.items.map((i) => i.product.id).join()),
    )[0]?.items || []
  );
}
export function alternatives(
  item: Candidate,
  look: Candidate[],
  products: Product[],
  metadata: Record<string, Metadata>,
  profile: Profile,
): Candidate[] {
  const otherCost = look
    .filter((c) => c.product.id !== item.product.id)
    .reduce((s, c) => s + cents(c.product.price), 0);
  return rank(products, metadata, profile)
    .filter(
      (c) =>
        c.role === item.role &&
        !look.some((i) => i.product.id === c.product.id) &&
        (profile.budget === null ||
          otherCost + cents(c.product.price) <= cents(profile.budget)),
    )
    .slice(0, 4);
}
export const total = (look: Candidate[]) =>
  look.reduce((s, c) => s + cents(c.product.price), 0) / 100;
export const lookNames = {
  natural: ["Natural Glow", "Una selección para un look fresco y sencillo."],
  soft_glam: ["Soft Glam", "Una selección para un look suave y arreglado."],
  glam: ["Glam", "Una selección para dar protagonismo a tu maquillaje."],
  bold_creative: [
    "Color & personalidad",
    "Una selección para explorar y expresarte.",
  ],
  "": ["A tu manera", "Una selección para descubrir tus próximos favoritos."],
} as const;
