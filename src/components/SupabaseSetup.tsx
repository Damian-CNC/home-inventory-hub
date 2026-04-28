import { useState } from "react";
import { motion } from "framer-motion";
import { Database, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { setSupabaseConfig } from "@/lib/supabaseClient";

export function SupabaseSetup({ onReady }: { onReady: () => void }) {
  const [url, setUrl] = useState("");
  const [anon, setAnon] = useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!url || !anon) return;
    setSupabaseConfig({ url: url.trim(), anon: anon.trim() });
    onReady();
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <motion.form
        onSubmit={submit}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-card border border-border rounded-2xl p-8 shadow-2xl"
      >
        <div className="flex flex-col items-center mb-6">
          <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-3">
            <Database className="w-7 h-7 text-primary" />
          </div>
          <h1 className="text-xl font-semibold tracking-tight">Konfiguracja Supabase</h1>
          <p className="text-sm text-muted-foreground mt-1 text-center">
            Podłącz swój zewnętrzny projekt Supabase
          </p>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="url">SUPABASE_URL</Label>
            <Input
              id="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://xxxx.supabase.co"
              autoFocus
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="anon">SUPABASE_ANON_KEY</Label>
            <Input
              id="anon"
              value={anon}
              onChange={(e) => setAnon(e.target.value)}
              placeholder="eyJhbGciOi..."
            />
          </div>

          <div className="text-xs text-muted-foreground bg-muted/50 rounded-lg p-3 flex gap-2">
            <ExternalLink className="w-4 h-4 shrink-0 mt-0.5" />
            <span>
              Znajdziesz je w panelu Supabase → Project Settings → API. Utwórz najpierw tabele
              z pliku <code className="text-foreground">schema.sql</code>.
            </span>
          </div>

          <Button type="submit" className="w-full" size="lg">
            Połącz
          </Button>
        </div>
      </motion.form>
    </div>
  );
}
