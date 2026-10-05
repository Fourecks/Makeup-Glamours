import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import ts from "typescript";
const source = await readFile("src/features/style/engine.ts", "utf8");
const output = ts.transpileModule(source, {
  compilerOptions: {
    target: ts.ScriptTarget.ES2020,
    module: ts.ModuleKind.ES2020,
  },
}).outputText;
const e = await import(
  `data:text/javascript;base64,${Buffer.from(output).toString("base64")}`
);
const products = Object.keys(e.roles).flatMap((role, i) =>
  [0, 1, 2].map((j) => ({
    id: `${role}-${j}`,
    name: role,
    category: role,
    price: 5 + j * 4,
    description: "",
    image_url: "",
    stock: 2,
    variants: [],
    created_at: "2026-01-01",
  })),
);
const metadata = Object.fromEntries(
  products.map((p) => [
    p.id,
    {
      ...e.emptyMetadata(),
      role: p.category,
      recommendation_enabled: true,
      styles: ["natural", "soft_glam", "glam", "bold_creative"],
      occasions: ["diario"],
      finishes: ["luminoso"],
    },
  ]),
);
const base = {
  style: "natural",
  occasion: "diario",
  groups: [],
  finish: "luminoso",
  experience: "intermedio",
  budget: 30,
};
let cases = 0;
for (const style of [...Object.keys(e.styles), ""])
  for (const budget of [1, 5, 10, 25, 50, 100, null])
    for (const experience of ["principiante", "intermedio", "experto"])
      for (const groups of [[], ["labios"], ["rostro", "ojos"], ["skincare"]]) {
        const profile = { ...base, style, budget, experience, groups };
        const look = e.compose(products, metadata, profile);
        cases++;
        assert.ok(budget === null || e.total(look) <= budget);
        assert.equal(new Set(look.map((c) => c.role)).size, look.length);
        assert.ok(
          look.every((c) => products.some((p) => p.id === c.product.id)),
        );
        assert.ok(
          look.every((c) => !groups.length || groups.includes(c.group)),
        );
        assert.ok(experience !== "principiante" || look.length <= 3);
        assert.deepEqual(e.compose(products, metadata, profile), look);
        for (const item of look) {
          const alternatives = e.alternatives(
            item,
            look,
            products,
            metadata,
            profile,
          );
          assert.ok(alternatives.length <= 4);
          for (const replacement of alternatives) {
            assert.equal(replacement.role, item.role);
            assert.ok(
              !look.some((c) => c.product.id === replacement.product.id),
            );
            assert.ok(
              budget === null ||
                e.total(look.filter((c) => c !== item).concat(replacement)) <=
                  budget,
            );
          }
        }
      }
metadata["blush-0"].recommendation_enabled = false;
products.find((p) => p.id === "mascara-0").stock = 0;
metadata["base-0"].level = "intermedio";
assert.ok(
  !e
    .rank(products, metadata, { ...base, experience: "principiante" })
    .some((c) => ["blush-0", "mascara-0", "base-0"].includes(c.product.id)),
);
const variantProduct = {
  ...products[0],
  stock: 99,
  variants: [
    { id: "a", stock: 0 },
    { id: "b", stock: 2 },
  ],
};
assert.equal(e.stock(variantProduct), 2);
assert.equal(
  e.remaining(
    variantProduct,
    [{ productId: variantProduct.id, variantId: "b", quantity: 2 }],
    "b",
  ),
  0,
);
assert.equal(
  e.stock({ ...variantProduct, variants: [{ id: "a", stock: 0 }] }),
  0,
);
assert.equal(e.inferRole("Rubores"), "blush");
assert.equal(e.inferRole("Máscaras de pestañas"), "mascara");
assert.equal(e.inferRole("LABIOS OJOS Y POMULOS"), null);
assert.equal(e.inferRole("Perfumes"), null);
assert.deepEqual(e.budgetOptions([], {}), []);
assert.ok(e.rank(products, metadata, base).every((c) => c.score === 11));
const decimalProducts = products
  .slice(0, 3)
  .map((p, i) => ({
    ...p,
    id: `decimal-${i}`,
    category: ["blush", "labios", "mascara"][i],
    price: [0.1, 0.2, 0.3][i],
  }));
const dm = Object.fromEntries(
  decimalProducts.map((p) => [
    p.id,
    { ...e.emptyMetadata(), role: p.category, recommendation_enabled: true },
  ]),
);
assert.ok(
  e.total(e.compose(decimalProducts, dm, { ...base, budget: 0.3 })) <= 0.3,
);
console.log(
  `Style engine: ${cases} profile/budget/experience/category scenarios passed, deterministic results, stock, variants, exclusions and alternatives.`,
);
if (process.env.STYLE_REAL_FIXTURE) {
  const real = JSON.parse(
    await readFile(process.env.STYLE_REAL_FIXTURE, "utf8"),
  );
  const budgets = e.budgetOptions(real.products, real.metadata);
  let realCases = 0;
  const begin = performance.now();
  for (const style of [...Object.keys(e.styles), ""])
    for (const budget of [...budgets, null])
      for (const experience of ["principiante", "intermedio", "experto"])
        for (const groups of [
          [],
          ["rostro"],
          ["ojos"],
          ["labios"],
          ["cejas"],
          ["skincare"],
          ["rostro", "labios"],
        ]) {
          const profile = { ...base, style, budget, experience, groups };
          const look = e.compose(real.products, real.metadata, profile);
          realCases++;
          assert.ok(budget === null || e.total(look) <= budget);
          assert.equal(new Set(look.map((c) => c.role)).size, look.length);
          assert.ok(
            look.every(
              (c) =>
                real.products.some((p) => p.id === c.product.id) &&
                e.stock(c.product) > 0 &&
                real.metadata[c.product.id].recommendation_enabled,
            ),
          );
        }
  console.log(
    `Real catalog: ${realCases} scenarios; budgets ${budgets.join(", ")}; ${Math.round(performance.now() - begin)}ms total.`,
  );
}
