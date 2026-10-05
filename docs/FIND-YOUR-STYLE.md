# Encuentra tu estilo — V1

## Integración y archivos

La ruta `/encuentra-tu-estilo/` usa el router existente. No hay un segundo catálogo, carrito ni checkout.

- `src/features/style/engine.ts`: contratos del perfil y metadata, roles, scoring, presupuesto, composición y alternativas. Es puro y no depende de React/Supabase; se puede sustituir por otro proveedor de recomendaciones conservando los contratos.
- `src/features/style/StyleQuiz.tsx`: seis preguntas, resultados, alternativas y selección explícita de variantes. Pasa productos y variantes a `App.handleAddToCart` después de validar todo el look; no añade una selección parcial si falta un tono o stock.
- `src/features/style/data.ts`: acceso a metadata y eventos internos.
- `src/features/style/MetadataEditor.tsx`: campos compactos dentro del formulario existente y sesión administrativa independiente.
- `src/App.tsx`, `src/components/AdminDashboard.tsx`, `src/components/ProductEditModal.tsx`: carga/guardado de metadata sin enviarla accidentalmente a `products`, sección Home y conexión del carrito existente. El formulario espera el guardado y conserva errores visibles.
- `src/components/Header.tsx`, `src/lib/routes.ts`: acceso y ruta nueva. Las URLs existentes se conservan.
- `src/styles.css`: estilos de esta funcionalidad sobre la identidad existente.
- `scripts/build-pages.mjs`: página estática, canonical, Open Graph y sitemap para la nueva ruta.
- `tests/style.mjs`, `supabase/tests/style_rls.sql`, `package.json`: pruebas y comando `npm run test:style`.

No se modificó `CartModal.tsx`, su generador de WhatsApp, las imágenes ni las tablas de productos/variantes. No se agregaron dependencias.

## Esquema real y decisión de datos

`products` contiene id UUID, name, price numeric, description, category textual, image_url textual (URLs separadas por comas), stock, images JSONB y created_at. No hay columna de marca ni tabla de categorías: las categorías se derivan de los productos. `product_variants` tiene product_id, name, stock y image_url; cuando hay variantes, su stock es la fuente de disponibilidad y no el stock base del producto. Las fotografías siguen en `product-images`.

Migración: `supabase/migrations/20261005002336_find_your_style.sql`.

Tabla nueva `product_recommendations`: una fila por producto, FK/PK product_id, arrays tipados mediante CHECK para styles/occasions/finishes, role nullable, level, enabled, priority y reviewed. Los arrays permiten múltiples valores sin crear muchas columnas en products; el contrato permite evolucionar posteriormente. No almacena datos personales ni perfiles de clientas.

RLS permite SELECT de la metadata necesaria y reserva INSERT/UPDATE/DELETE a JWT autenticado con `app_metadata.role = admin`. No utiliza user_metadata ni isAdmin/localStorage para autorizar escrituras. Se revocaron los permisos anónimos de escritura. Las políticas de las tablas existentes no se cambiaron.

La sesión `makeup-style-admin-v1` utiliza un cliente separado para no cambiar el cliente anónimo que usa el admin anterior para productos e imágenes. Conectar/desconectar recomendaciones no cambia ese comportamiento. La cuenta administrativa elegida se configuró en Supabase Auth, fuera del seed; ninguna contraseña o clave privilegiada forma parte del repositorio.

## Clasificación inicial

Se crearon 50 filas sin recrear productos. 43 reciben un rol desde categorías inequívocas; 11 reciben al menos un acabado expresamente descrito como «acabado mate/natural/luminoso/satinado/brillante/alto brillo». No se dedujeron estilos, ocasiones, nivel de dificultad ni propiedades cosméticas por marca o fotografías. Nivel genérico `cualquiera`, prioridad normal, arrays desconocidos vacíos y reviewed=false en los 50.

Los siete productos sin rol quedan desactivados hasta revisión:

- Elf Mascara transparente — Cejas y pestañas.
- Garnier Fructis Glossing Spray — Cabello.
- Elf blush tint — Tintas.
- Monochromatic multi-stick Elf — LABIOS OJOS Y POMULOS.
- Ariana Grande Thank u next 2.0 — Perfumes.
- Ary by Ariana Grande Eau de parfum — Perfumes.
- Japanese Cherry Blossom Body Cream — Cremas Corporales.

Todos los productos siguen pendientes de revisión editorial. Los 43 con rol pueden participar sin esperar la revisión; los campos vacíos no aportan coincidencias al scoring. Así V1 funciona con datos reales sin fingir que cada producto ya está validado para un estilo. Algunas categorías históricas pueden contener productos mal clasificados; el admin puede corregir el rol manualmente.

`ON CONFLICT(product_id) DO NOTHING` hace el seed idempotente y protege cualquier corrección manual, incluso si la fila no está marcada como revisada. Se puede repetir la migración para incorporar productos posteriores sin metadata. La edición de un producto nuevo sugiere el rol según categoría; con la administración conectada se guarda junto al nuevo producto. Sin esa sesión se mantiene el alta de productos anterior y la metadata queda pendiente del seed o de una revisión administrativa posterior.

## Motor y presupuesto

Se descartan productos desactivados, sin rol, sin stock fiable positivo o sin precio válido positivo. Las variantes disponibles determinan el stock. Las categorías elegidas son un filtro estricto y los productos de nivel intermedio se excluyen para principiantes.

Puntos: estilo +4, ocasión +3, acabado +2, nivel apropiado/genérico +2, grupo solicitado +3 y prioridad +0/1/2. Empates por precio y UUID, nunca al azar.

La composición usa una mochila de elección múltiple en centavos: máximo un producto por rol, sin repetir productos, premiando diversidad de grupos, roles esenciales y compatibilidad. La secuencia de roles cambia con el estilo. Límite de 3 productos para principiantes; para otros niveles hasta 3/5/7 según presupuesto. No supera el límite elegido ni lo rellena con productos irrelevantes. Si no hay coincidencias disponibles, muestra un estado vacío.

Rangos derivados de la mediana de precios de productos elegibles en stock, multiplicada por 2/4/6 y redondeada a múltiplos de $5. En el catálogo verificado: $30 / $60 / $85. También existe presupuesto ilimitado. No se inventan precios, ofertas ni ratings.

«Cambiar» usa el mismo ranking, exige el mismo rol y verifica el total con los demás productos. Ofrece hasta cuatro alternativas reales; si no hay suficientes, muestra las que existen o explica la ausencia.

Las variantes no se escogen automáticamente. La visitante elige el tono antes de añadir el look. El test no determina tono de piel ni hace recomendaciones médicas. El carrito y WhatsApp coordinan la disponibilidad final como antes.

## Persistencia y medición

Solo se guarda el perfil no personal en `makeup-style-profile-v1`. Se valida al leerlo y la última selección se recalcula con el catálogo actual; no se persiste una copia de productos o stock. localStorage bloqueado no impide usar el quiz.

Eventos `makeup:analytics` mediante CustomEvent: style_quiz_started, style_quiz_completed, style_result_viewed, style_product_changed y style_look_added_to_cart. Un futuro adaptador puede escuchar el evento y conectarlo al sistema analítico elegido. No se envía nada a servicios externos.

## Supabase y operación

La migración ya se aplicó al proyecto existente. La cuenta elegida ya tiene app_metadata.role=admin. No hay SQL pendiente para activar V1. En el admin, abrir un producto → Encuentra tu estilo → conectar la administración con el correo y contraseña de Supabase. Si el rol se asigna mientras hay una sesión abierta, reconectar para renovar el JWT.

Crear o cambiar cuentas administrativas se realiza desde Supabase Auth; nunca desde metadata editable por el usuario. No incluir el correo del propietario en una migración distribuida ni asignar permisos a cualquier cuenta que se registre.

El admin anterior y sus políticas conservan su configuración: la autenticación local histórica no asegura las escrituras de products/storage. La nueva protección solo cubre product_recommendations. Una migración completa de seguridad del admin existente requiere una tarea separada para no cambiar las políticas pedidas en esta V1.

Render sigue siendo estático. Añadir una redirección exacta `/encuentra-tu-estilo` → `/encuentra-tu-estilo/` (301) antes del rewrite `/*` → `/index.html`, como las otras páginas. No usar una regla que vuelva a redirigir la URL con barra final.

## Verificación y reversión

`npm run check`, `npm run build`, `npm run test:style`, `npm run test:routes`, `npm run test:whatsapp`.

El motor prueba 420 combinaciones de fixtures y, con STYLE_REAL_FIXTURE apuntando a un snapshot público, otras 420 del catálogo real. Incluye estilos, presupuestos, experiencia, categorías, variantes, stock, exclusiones, alternativas, determinismo y céntimos. RLS se verifica con roles anon, authenticated sin admin (incluida falsificación de user_metadata) y authenticated con app_metadata admin; todas las mutaciones se revierten con ROLLBACK. Se comprobó también que repetir el seed mantiene las correcciones manuales.

Para revertir solo esta V1: `git revert <commit-de-esta-funcionalidad>` y desplegar el resultado en Render. No volver a un commit anterior al rediseño. Retirar únicamente la redirección exacta nueva si se desea. La tabla adicional puede permanecer sin afectar al sitio anterior y conserva las clasificaciones; no es necesario borrarla. La cuenta Auth y su rol pueden permanecer para una futura administración segura. Si se decide retirar datos o permisos, exportarlos y hacerlo explícitamente desde Supabase; este procedimiento no los destruye automáticamente.
