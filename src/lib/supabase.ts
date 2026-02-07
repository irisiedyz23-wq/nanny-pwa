import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface WorkRecord {
  id: string;
  date: string;
  period: 'AM' | 'PM';
  is_working: boolean;
  created_at: string;
  updated_at: string;
}
