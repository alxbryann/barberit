import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
});

export type UserRole = "barbero" | "cliente";

export interface Profile {
  id: string;
  role: UserRole;
  nombre: string;
  telefono?: string;
  created_at: string;
}

export interface Barbero {
  id: string;
  slug: string;
  especialidades: string[];
  rating: number;
  total_cortes: number;
  desde_año: number;
  bio?: string;
  foto_url?: string;
  video_url?: string;
  /** Nombre comercial de la barbería; el nombre del barbero va en Profile.nombre */
  nombre_barberia?: string | null;
  activo: boolean;
}
