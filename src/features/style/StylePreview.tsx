import type { Product } from "../../types";
import { stock, type Metadata } from "./engine";
export default function StylePreview({
  products,
  metadata,
}: {
  products: Product[];
  metadata: Record<string, Metadata>;
}) {
  const selection = ["blush", "labios", "mascara"]
    .map((role) =>
      products.find(
        (p) =>
          metadata[p.id]?.recommendation_enabled &&
          metadata[p.id]?.role === role &&
          stock(p) > 0 &&
          p.image_url,
      ),
    )
    .filter((p): p is Product => !!p);
  if (!selection.length) return null;
  return (
    <div className="style-preview">
      {selection.map((p) => (
        <div key={p.id}>
          <img
            src={p.image_url.split(",")[0].trim()}
            alt={p.name}
            loading="lazy"
            decoding="async"
            width="260"
            height="300"
          />
        </div>
      ))}
    </div>
  );
}
