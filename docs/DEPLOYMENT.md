# Tienda con páginas propias en Render

Se conserva React/Vite y el servicio estático existente de Render, conectado a Fourecks/Makeup-Glamours, rama main.

Rutas públicas: `/`, `/tienda`, `/categorias`, `/categorias/:categoria`, `/novedades`, `/producto/:nombre--:id`. El ID permite conservar enlaces a productos aunque cambie el nombre. Los enlaces anteriores a secciones se redirigen dentro de la aplicación.

`npm run build` compila la aplicación y genera HTML para productos y categorías reales, metadatos, datos estructurados, sitemap y robots. Requiere las variables públicas de Supabase ya utilizadas por la tienda. Los datos vivos siguen consultándose desde Supabase, por lo que el carrito, las variantes y el panel administrativo conservan su comportamiento. El mensaje original de WhatsApp tiene una prueba de regresión.

En Render: publicar `dist`; compilación recomendada `npm ci && npm run build`; regla Rewrite `/*` → `/index.html` para enlaces nuevos y navegación directa. Los archivos estáticos existentes se sirven antes de aplicar la regla.

Al añadir o renombrar productos/categorías, las páginas funcionan inmediatamente en React. Para regenerar los metadatos HTML que usan buscadores y previsualizaciones sociales, ejecutar un nuevo despliegue en Render. No se han agregado tablas, migraciones ni funciones de servidor.

Validación local: `npm run check`, `npm run test:routes`, `npm run test:whatsapp`, `npm run build`.

Render sirve los HTML de cada página bajo la URL con barra final. Las redirecciones 301 de tienda, categorías, novedades y productos añaden esa barra antes del fallback. Canonical y sitemap apuntan a esa URL final.
