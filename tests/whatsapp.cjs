const assert = require("node:assert/strict");
const vm = require("node:vm");
const fs = require("node:fs");
const source = fs.readFileSync(
  process.argv[2] || "src/components/CartModal.tsx",
  "utf8",
);
const block = source.slice(
  source.indexOf("  const handleFinalizePurchase"),
  source.indexOf(
    "\n\n\n  return",
    source.indexOf("  const handleFinalizePurchase"),
  ),
);
let opened;
const context = {
  cartItems: [
    {
      productName: "Elf cream blush stick",
      variantName: "Plum intended",
      price: 15,
      quantity: 2,
    },
    {
      productName: "Neutrogena intense gel eyeliner",
      variantName: null,
      price: 12,
      quantity: 1,
    },
  ],
  subtotal: 42,
  phoneNumber: "50375771383",
  window: {
    open: (...args) => {
      opened = args;
    },
  },
};
vm.runInNewContext(block + ";handleFinalizePurchase();", context);
const url = new URL(opened[0]);
assert.equal(url.origin, "https://wa.me");
assert.equal(url.pathname, "/50375771383");
assert.equal(
  url.searchParams.get("text"),
  "Hola, estoy interesado/a en finalizar la compra de los siguientes productos:\n\n- 2x Elf cream blush stick (Plum intended) - $30.00\n- 1x Neutrogena intense gel eyeliner - $12.00\n\n*Total a Pagar: $42.00*",
);
assert.deepEqual(opened.slice(1), ["_blank", "noopener,noreferrer"]);
console.log(
  "PASS: WhatsApp original intacto; productos, variantes, cantidades, subtotal y codificación correctos.",
);
