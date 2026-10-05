import { createClient } from "@supabase/supabase-js";
import type { Metadata } from "./engine";
// Isolated session: authenticating metadata must not alter the existing admin's catalog/storage client.
export const styleClient = createClient(
  import.meta.env.VITE_SUPABASE_URL || "https://placeholder.supabase.co",
  import.meta.env.VITE_SUPABASE_ANON_KEY || "placeholder-key",
  { auth: { storageKey: "makeup-style-admin-v1" } },
);
export async function loadMetadata(): Promise<Record<string, Metadata>> {
  const { data, error } = await styleClient
    .from("product_recommendations")
    .select(
      "product_id,styles,occasions,finishes,role,level,recommendation_enabled,recommendation_priority,recommendation_reviewed",
    );
  if (error) throw error;
  return Object.fromEntries((data || []).map((m) => [m.product_id, m]));
}
export function trackStyle(
  event:
    | "style_quiz_started"
    | "style_quiz_completed"
    | "style_result_viewed"
    | "style_product_changed"
    | "style_look_added_to_cart",
  detail: Record<string, unknown> = {},
) {
  window.dispatchEvent(
    new CustomEvent("makeup:analytics", {
      detail: { event, version: 1, ...detail },
    }),
  );
}
