// FIX: Replaced the Vite client types reference with a manual interface declaration
// for `import.meta.env` to resolve type definition errors. This ensures
// that environment variables are correctly typed across the application.
interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string;
  readonly VITE_SUPABASE_ANON_KEY: string;
  readonly VITE_SUPABASE_BUCKET: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
