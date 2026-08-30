import { createClient } from '@supabase/supabase-js';

// Variables de entorno obtenidas desde import.meta.env de Vite o process.env en Node
const supabaseUrl =
  (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_SUPABASE_URL) ||
  (typeof process !== 'undefined' && process.env && process.env.VITE_SUPABASE_URL) ||
  '';

const supabaseAnonKey =
  (typeof import.meta !== 'undefined' && import.meta.env && (import.meta.env.VITE_SUPABASE_ANON_KEY || import.meta.env.VITE_SUPABASE_KEY)) ||
  (typeof process !== 'undefined' && process.env && (process.env.VITE_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_KEY)) ||
  '';

// Se inicializa y exporta la instancia del cliente Supabase
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
export default supabase;
