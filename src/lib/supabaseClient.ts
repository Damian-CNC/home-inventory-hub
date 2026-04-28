import { createClient, SupabaseClient } from "@supabase/supabase-js";

const URL_KEY = "ho.supabase.url";
const ANON_KEY = "ho.supabase.anon";

let client: SupabaseClient | null = null;

export type SupabaseConfig = { url: string; anon: string };

export function getSupabaseConfig(): SupabaseConfig | null {
  if (typeof window === "undefined") return null;
  const url = localStorage.getItem(URL_KEY);
  const anon = localStorage.getItem(ANON_KEY);
  if (!url || !anon) return null;
  return { url, anon };
}

export function setSupabaseConfig(cfg: SupabaseConfig) {
  localStorage.setItem(URL_KEY, cfg.url);
  localStorage.setItem(ANON_KEY, cfg.anon);
  client = createClient(cfg.url, cfg.anon);
}

export function clearSupabaseConfig() {
  localStorage.removeItem(URL_KEY);
  localStorage.removeItem(ANON_KEY);
  client = null;
}

export function getSupabase(): SupabaseClient | null {
  if (client) return client;
  const cfg = getSupabaseConfig();
  if (!cfg) return null;
  client = createClient(cfg.url, cfg.anon);
  return client;
}

export type Location = {
  id: string;
  name: string;
  icon: string;
  created_at?: string;
};

export type ItemType = "count" | "weight" | "liquid";

export type Item = {
  id: string;
  location_id: string;
  name: string;
  quantity: number;
  unit: string;
  total_capacity: number | null;
  type: ItemType;
  tags: string[];
  created_at?: string;
};
