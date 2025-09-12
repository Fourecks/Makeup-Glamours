import { createClient } from '@supabase/supabase-js';

const supabaseUrl = "https://bmhdvviimedoiysmzarz.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJtaGR2dmlpbWVkb2l5c216YXJ6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc1NTYyNjUsImV4cCI6MjA3MzEzMjI2NX0.IEIEWMVGEz4W3moA1Uzd-CRms0Gv8kflvytq16y4taI";

if (!supabaseUrl || !supabaseAnonKey) {
  const errorMessage = "Supabase URL or anonymous key is missing. Please check the hardcoded values in supabaseClient.ts.";
  console.error(errorMessage);
  throw new Error(errorMessage);
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);