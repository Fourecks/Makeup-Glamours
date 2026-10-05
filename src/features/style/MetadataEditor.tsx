import { useEffect, useState } from "react";
import { finishes, occasions, roles, styles, type Metadata } from "./engine";
import { styleClient } from "./data";
export default function MetadataEditor({
  value,
  onChange,
  onAuthorized,
}: {
  value: Metadata;
  onChange: (m: Metadata) => void;
  onAuthorized: (v: boolean) => void;
}) {
  const [authorized, setAuthorized] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    onAuthorized(authorized);
  }, [authorized, onAuthorized]);
  useEffect(() => {
    styleClient.auth
      .getSession()
      .then(({ data }) =>
        setAuthorized(data.session?.user.app_metadata?.role === "admin"),
      );
    const { data } = styleClient.auth.onAuthStateChange((_event, session) =>
      setAuthorized(session?.user.app_metadata?.role === "admin"),
    );
    return () => data.subscription.unsubscribe();
  }, []);
  async function signIn() {
    setBusy(true);
    const { data, error } = await styleClient.auth.signInWithPassword({
      email,
      password,
    });
    setPassword("");
    setMessage(
      error
        ? "No se pudo iniciar sesión. Verifica tu correo y contraseña."
        : data.user?.app_metadata?.role === "admin"
          ? ""
          : "Esta cuenta todavía no tiene permiso administrativo.",
    );
    setBusy(false);
  }
  const patch = (p: Partial<Metadata>) => onChange({ ...value, ...p });
  return (
    <details className="style-admin">
      <summary>
        Encuentra tu estilo{" "}
        <span>
          {value.recommendation_reviewed ? "Revisado" : "Pendiente de revisión"}
        </span>
      </summary>
      {!authorized && (
        <div className="style-auth">
          <p>
            Para editar estas recomendaciones, inicia sesión con tu cuenta
            administrativa de Supabase. El resto del formulario conserva su
            acceso actual.
          </p>
          <label>
            Correo de administración
            <input
              type="email"
              autoComplete="username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </label>
          <label>
            Contraseña
            <input
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </label>
          <button
            type="button"
            className="text-link"
            disabled={busy || !email || !password}
            onClick={signIn}
          >
            Conectar administración
          </button>
        </div>
      )}
      {message && <p role="status">{message}</p>}
      <fieldset disabled={!authorized} className="style-metadata-fields">
        <label>
          <input
            type="checkbox"
            checked={value.recommendation_enabled}
            onChange={(e) =>
              patch({ recommendation_enabled: e.target.checked })
            }
          />{" "}
          Participa en recomendaciones
        </label>
        <div className="style-admin-selects">
          <label>
            Rol
            <select
              value={value.role || ""}
              onChange={(e) =>
                patch({ role: (e.target.value as Metadata["role"]) || null })
              }
            >
              <option value="">Sin clasificar</option>
              {Object.entries(roles).map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>
          </label>
          <label>
            Nivel
            <select
              value={value.level}
              onChange={(e) =>
                patch({ level: e.target.value as Metadata["level"] })
              }
            >
              <option value="cualquiera">Cualquiera</option>
              <option value="principiante">Principiante</option>
              <option value="intermedio">Intermedio</option>
            </select>
          </label>
          <label>
            Prioridad
            <select
              value={value.recommendation_priority}
              onChange={(e) =>
                patch({
                  recommendation_priority: Number(e.target.value) as 0 | 1 | 2,
                })
              }
            >
              <option value="0">Normal</option>
              <option value="1">Recomendado</option>
              <option value="2">Destacado</option>
            </select>
          </label>
        </div>
        {(["styles", "occasions", "finishes"] as const).map((field, index) => (
          <fieldset key={field}>
            <legend>{["Estilos", "Ocasiones", "Acabados"][index]}</legend>
            <div className="style-chips">
              {Object.entries([styles, occasions, finishes][index]).map(
                ([key, label]) => (
                  <label key={key}>
                    <input
                      type="checkbox"
                      checked={(value[field] as string[]).includes(key)}
                      onChange={(e) =>
                        patch({
                          [field]: e.target.checked
                            ? [...value[field], key]
                            : value[field].filter((v) => v !== key),
                        } as Partial<Metadata>)
                      }
                    />
                    {label}
                  </label>
                ),
              )}
            </div>
          </fieldset>
        ))}
        <label>
          <input
            type="checkbox"
            checked={value.recommendation_reviewed}
            onChange={(e) =>
              patch({ recommendation_reviewed: e.target.checked })
            }
          />{" "}
          Información revisada
        </label>
      </fieldset>
      {authorized && (
        <button
          type="button"
          className="text-link"
          onClick={() => styleClient.auth.signOut()}
        >
          Desconectar recomendaciones
        </button>
      )}
    </details>
  );
}
