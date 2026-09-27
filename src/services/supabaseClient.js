import { createClient } from '@supabase/supabase-js';

// Se obtienen las credenciales de Supabase desde las variables de entorno de Vite.
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error(
    "Faltan las variables de entorno de Supabase (VITE_SUPABASE_URL). Compruebe el archivo .env.local.",
  );
}

// Se inicializa y exporta la instancia del cliente de Supabase.
export const supabase = createClient(supabaseUrl || "", supabaseKey || "");
