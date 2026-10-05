import { useEffect, useMemo, useRef, useState } from "react";
import type { Product, ProductVariant, CartItem } from "../../types";
import { productPath } from "../../lib/routes";
import {
  alternatives,
  budgetOptions,
  compose,
  finishes,
  lookNames,
  occasions,
  remaining,
  roles,
  styles,
  total,
  type Candidate,
  type Group,
  type Metadata,
  type Profile,
} from "./engine";
import StylePreview from "./StylePreview";
import { trackStyle } from "./data";
const initial: Profile = {
  style: "",
  occasion: "diario",
  groups: [],
  finish: "",
  experience: "principiante",
  budget: null,
};
const groupLabels: Record<Group, string> = {
  rostro: "Rostro",
  ojos: "Ojos",
  labios: "Labios",
  cejas: "Cejas",
  skincare: "Skincare",
};
const money = (n: number) => `$${Number(n).toFixed(2)}`;
export default function StyleQuiz({
  products,
  metadata,
  error,
  onAdd,
  onCart,
  cartItems,
}: {
  products: Product[];
  metadata: Record<string, Metadata>;
  error: string;
  onAdd: (p: Product, q: number, v: ProductVariant | null) => void;
  onCart: () => void;
  cartItems: CartItem[];
}) {
  const [profile, setProfile] = useState<Profile>(initial);
  const [step, setStep] = useState(-1);
  const [look, setLook] = useState<Candidate[]>([]);
  const [changing, setChanging] = useState<string | null>(null);
  const [variants, setVariants] = useState<Record<string, string>>({});
  const [notice, setNotice] = useState("");
  const [restored, setRestored] = useState(false);
  const heading = useRef<HTMLHeadingElement>(null);
  const alternativesHeading = useRef<HTMLHeadingElement>(null);
  const budgets = useMemo(
    () => budgetOptions(products, metadata),
    [products, metadata],
  );
  useEffect(() => {
    try {
      const saved = JSON.parse(
        localStorage.getItem("makeup-style-profile-v1") || "null",
      );
      if (
        saved &&
        Object.keys(styles).concat("").includes(saved.style) &&
        Object.keys(occasions).includes(saved.occasion) &&
        Array.isArray(saved.groups) &&
        saved.groups.every((g: string) => g in groupLabels) &&
        Object.keys(finishes).concat("").includes(saved.finish) &&
        ["principiante", "intermedio", "experto"].includes(saved.experience) &&
        (saved.budget === null ||
          (Number.isFinite(saved.budget) && saved.budget > 0))
      ) {
        setProfile(saved);
        setRestored(true);
      }
    } catch {
      /* Storage is optional. */
    }
  }, []);
  useEffect(() => {
    if (step >= 0) {
      heading.current?.focus({ preventScroll: true });
      window.scrollTo(0, 0);
    }
  }, [step]);
  useEffect(() => {
    if (changing) {
      alternativesHeading.current?.focus({ preventScroll: true });
      alternativesHeading.current?.scrollIntoView({
        block: "start",
        behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
          ? "auto"
          : "smooth",
      });
    }
  }, [changing]);
  const patch = (p: Partial<Profile>) =>
    setProfile((prev) => ({ ...prev, ...p }));
  function start() {
    trackStyle("style_quiz_started");
    setStep(0);
    setNotice("");
    setLook([]);
    setVariants({});
  }
  function finish(source: "quiz" | "restore" = "quiz") {
    const result = compose(products, metadata, profile);
    setLook(result);
    setStep(6);
    setChanging(null);
    setNotice("");
    setVariants({});
    try {
      localStorage.setItem("makeup-style-profile-v1", JSON.stringify(profile));
    } catch {}
    if (source === "quiz")
      trackStyle("style_quiz_completed", {
        style: profile.style,
        budget: profile.budget,
      });
    trackStyle("style_result_viewed", {
      productIds: result.map((c) => c.product.id),
    });
  }
  function change(next: Candidate) {
    setLook((prev) => prev.map((c) => (c.product.id === changing ? next : c)));
    setNotice("");
    trackStyle("style_product_changed", {
      from: changing,
      to: next.product.id,
    });
    setChanging(null);
  }
  const chosen = look.find((c) => c.product.id === changing);
  const replacements = chosen
    ? alternatives(chosen, look, products, metadata, profile)
    : [];
  const titles = [
    "¿Qué tipo de look buscas?",
    "¿Para qué ocasión?",
    "¿Qué productos te interesan?",
    "¿Qué acabado prefieres?",
    "¿Cuánta experiencia tienes maquillándote?",
    "¿Cuánto quieres gastar aproximadamente?",
  ];
  const canNext =
    step === 2 ||
    step === 0 ||
    step === 3 ||
    step === 5 ||
    Boolean(step === 1 ? profile.occasion : profile.experience);
  function options(
    values: Record<string, string>,
    selected: string,
    onSelect: (v: string) => void,
    descriptions: Record<string, string> = {},
  ) {
    return (
      <div className="style-options">
        {Object.entries(values).map(([key, label]) => (
          <button
            key={key}
            type="button"
            aria-pressed={selected === key}
            className={`style-option ${selected === key ? "is-selected" : ""}`}
            onClick={() => onSelect(key)}
          >
            <strong>{label}</strong>
            {descriptions[key] && <span>{descriptions[key]}</span>}
          </button>
        ))}
      </div>
    );
  }
  function addLook() {
    for (const c of look) {
      const p = products.find((p) => p.id === c.product.id);
      if (!p || !metadata[p.id]?.recommendation_enabled) {
        setNotice("El catálogo cambió. Vuelve a generar tu selección.");
        return;
      }
      const variantId = variants[p.id] || null;
      if (p.variants.length && !variantId) {
        setNotice(`Elige una variante de ${p.name} antes de añadir el look.`);
        return;
      }
      if (remaining(p, cartItems, variantId) < 1) {
        setNotice(
          `No hay más unidades disponibles de ${p.name} para añadir a tu carrito.`,
        );
        return;
      }
    }
    look.forEach((c) => {
      const p = products.find((p) => p.id === c.product.id)!;
      onAdd(p, 1, p.variants.find((v) => v.id === variants[p.id]) || null);
    });
    setNotice("Tu look está en el carrito.");
    trackStyle("style_look_added_to_cart", {
      productIds: look.map((c) => c.product.id),
      total: total(look),
    });
  }
  return (
    <main id="main-content" className="shop-shell style-page">
      <a href="/tienda" className="text-link">
        Volver a la tienda
      </a>
      {step === -1 ? (
        <section className="style-intro">
          <div className="style-intro-copy">
            <h1>Encuentra tu estilo</h1>
            <p>
              Elige cómo quieres maquillarte y cuánto quieres gastar. Nosotros
              te ayudamos con los productos.
            </p>
            {error ? (
              <p role="alert">{error}</p>
            ) : (
              <button
                className="primary-button"
                disabled={!budgets.length}
                onClick={start}
              >
                Empezar
              </button>
            )}
            {!error && !budgets.length && (
              <p>
                No hay productos disponibles para recomendar en este momento.{" "}
                <a href="/tienda">Explorar catálogo</a>
              </p>
            )}
            {restored && budgets.length > 0 && (
              <button className="text-link" onClick={() => finish("restore")}>
                Ver mi última selección
              </button>
            )}
          </div>
          <StylePreview products={products} metadata={metadata} />
        </section>
      ) : step < 6 ? (
        <section className="style-question">
          <div className="style-progress">
            <span>{step + 1} de 6</span>
            <progress
              value={step + 1}
              max={6}
              aria-label={`Pregunta ${step + 1} de 6`}
            />
          </div>
          <h1 ref={heading} tabIndex={-1}>
            {titles[step]}
          </h1>
          {step === 0 &&
            options(
              { ...styles, "": "No estoy segura" },
              profile.style,
              (v) => patch({ style: v as Profile["style"] }),
              {
                natural: "Fresco y sencillo",
                soft_glam: "Suave pero arreglado",
                glam: "Más definido y protagonista",
                bold_creative: "Color y personalidad",
              },
            )}
          {step === 1 &&
            options(occasions, profile.occasion, (v) =>
              patch({ occasion: v as Profile["occasion"] }),
            )}
          {step === 2 && (
            <>
              <p>Puedes elegir varias categorías.</p>
              <div className="style-options">
                {Object.entries(groupLabels).map(([key, label]) => (
                  <button
                    className={`style-option ${profile.groups.includes(key as Group) ? "is-selected" : ""}`}
                    aria-pressed={profile.groups.includes(key as Group)}
                    key={key}
                    onClick={() =>
                      patch({
                        groups: profile.groups.includes(key as Group)
                          ? profile.groups.filter((g) => g !== key)
                          : [...profile.groups, key as Group],
                      })
                    }
                  >
                    {label}
                  </button>
                ))}
                <button
                  className={`style-option ${!profile.groups.length ? "is-selected" : ""}`}
                  aria-pressed={!profile.groups.length}
                  onClick={() => patch({ groups: [] })}
                >
                  Elige por mí
                </button>
              </div>
            </>
          )}
          {step === 3 &&
            options(
              {
                natural: "Natural",
                mate: "Mate",
                luminoso: "Luminoso",
                satinado: "Satinado",
                "": "No estoy segura",
              },
              profile.finish,
              (v) => patch({ finish: v as Profile["finish"] }),
            )}
          {step === 4 &&
            options(
              {
                principiante: "Estoy empezando",
                intermedio: "Ya conozco lo básico",
                experto: "Me encanta experimentar",
              },
              profile.experience,
              (v) => patch({ experience: v as Profile["experience"] }),
            )}
          {step === 5 && (
            <>
              {options(
                Object.fromEntries([
                  ...budgets.map((b) => [String(b), `Hasta ${money(b)}`]),
                  ["unlimited", "El presupuesto no es importante"],
                ]),
                profile.budget === null ? "unlimited" : String(profile.budget),
                (v) => patch({ budget: v === "unlimited" ? null : Number(v) }),
              )}
            </>
          )}
          <div className="style-step-actions">
            <button className="text-link" onClick={() => setStep(step - 1)}>
              Atrás
            </button>
            <button
              className="primary-button"
              disabled={!canNext}
              onClick={() => (step === 5 ? finish() : setStep(step + 1))}
            >
              {step === 5 ? "Encontrar mi look" : "Continuar"}
            </button>
          </div>
        </section>
      ) : (
        <section className="style-result">
          <h1 ref={heading} tabIndex={-1}>
            {lookNames[profile.style][0]}
          </h1>
          <p>{lookNames[profile.style][1]}</p>
          {!look.length ? (
            <p>
              No encontramos productos disponibles con estas preferencias y
              presupuesto. Puedes cambiar tus respuestas o{" "}
              <a href="/tienda">explorar la tienda</a>.
            </p>
          ) : (
            <>
              <h2>Tu look</h2>
              <div className="style-look-grid">
                {look.map((c) => (
                  <article className="style-look-card" key={c.product.id}>
                    <a href={productPath(c.product)}>
                      <img
                        loading="lazy"
                        src={
                          c.product.variants.find(
                            (v) => v.id === variants[c.product.id],
                          )?.image_url ||
                          c.product.image_url?.split(",")[0]?.trim()
                        }
                        alt={c.product.name}
                      />
                    </a>
                    <p className="eyebrow">{roles[c.role]}</p>
                    <a href={productPath(c.product)}>{c.product.name}</a>
                    <strong>{money(c.product.price)}</strong>
                    {c.product.variants.length > 0 && (
                      <label>
                        Elige tu variante
                        <select
                          aria-label={`Variante de ${c.product.name}`}
                          value={variants[c.product.id] || ""}
                          onChange={(e) => {
                            setVariants((prev) => ({
                              ...prev,
                              [c.product.id]: e.target.value,
                            }));
                            setNotice("");
                          }}
                        >
                          <option value="">Seleccionar variante</option>
                          {c.product.variants
                            .filter((v) => v.stock > 0)
                            .map((v) => (
                              <option
                                key={v.id}
                                value={v.id}
                                disabled={
                                  remaining(c.product, cartItems, v.id) < 1
                                }
                              >
                                {v.name}
                                {remaining(c.product, cartItems, v.id) < 1
                                  ? " — Ya en tu carrito"
                                  : ""}
                              </option>
                            ))}
                        </select>
                      </label>
                    )}
                    <button
                      className="text-link"
                      onClick={() =>
                        setChanging(
                          changing === c.product.id ? null : c.product.id,
                        )
                      }
                      aria-expanded={changing === c.product.id}
                    >
                      Cambiar
                    </button>
                  </article>
                ))}
              </div>
              {chosen && (
                <section
                  className="style-alternatives"
                  aria-label={`Alternativas de ${roles[chosen.role]}`}
                >
                  <h3 ref={alternativesHeading} tabIndex={-1}>
                    Otra opción para {roles[chosen.role].toLowerCase()}
                  </h3>
                  {!replacements.length ? (
                    <p>
                      No hay otras opciones disponibles de este rol dentro de tu
                      presupuesto.
                    </p>
                  ) : (
                    <div className="style-alternative-grid">
                      {replacements.map((c) => (
                        <button
                          key={c.product.id}
                          className="style-option"
                          onClick={() => change(c)}
                        >
                          <img
                            loading="lazy"
                            src={c.product.image_url?.split(",")[0]?.trim()}
                            alt=""
                          />
                          <strong>{c.product.name}</strong>
                          <span>{money(c.product.price)}</span>
                        </button>
                      ))}
                    </div>
                  )}
                  <button
                    className="text-link"
                    onClick={() => setChanging(null)}
                  >
                    Cerrar alternativas
                  </button>
                </section>
              )}
              <div className="style-total">
                <span>Total de tu look</span>
                <strong>{money(total(look))}</strong>
                <button className="primary-button" onClick={addLook}>
                  Agregar look al carrito
                </button>
              </div>
            </>
          )}
          {notice && (
            <div role="status" className="style-notice">
              {notice}
              {notice === "Tu look está en el carrito." && (
                <button className="text-link" onClick={onCart}>
                  Ver carrito
                </button>
              )}
            </div>
          )}
          <button className="text-link" onClick={start}>
            Volver a hacer el test
          </button>
        </section>
      )}
    </main>
  );
}
