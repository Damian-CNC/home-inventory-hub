import { useState } from "react";
import { motion } from "framer-motion";
import { Lock, KeyRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { checkPassword, rememberAuth, sessionAuth } from "@/lib/auth";

export function LockScreen({ onUnlock }: { onUnlock: () => void }) {
  const [pwd, setPwd] = useState("");
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (checkPassword(pwd)) {
      if (remember) rememberAuth();
      else sessionAuth();
      onUnlock();
    } else {
      setError(true);
      setTimeout(() => setError(false), 600);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <motion.form
        onSubmit={submit}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-sm bg-card border border-border rounded-2xl p-8 shadow-2xl"
      >
        <motion.div
          animate={error ? { x: [-8, 8, -6, 6, 0] } : {}}
          transition={{ duration: 0.4 }}
          className="flex flex-col items-center mb-6"
        >
          <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-3">
            <Lock className="w-7 h-7 text-primary" />
          </div>
          <h1 className="text-xl font-semibold tracking-tight">Home Organizer</h1>
          <p className="text-sm text-muted-foreground mt-1">Wprowadź hasło, aby kontynuować</p>
        </motion.div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="pwd">Hasło</Label>
            <div className="relative">
              <KeyRound className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="pwd"
                type="password"
                value={pwd}
                onChange={(e) => setPwd(e.target.value)}
                className="pl-9"
                placeholder="••••••••"
                autoFocus
              />
            </div>
            {error && <p className="text-xs text-destructive">Nieprawidłowe hasło</p>}
          </div>

          <label className="flex items-center gap-2 text-sm cursor-pointer select-none">
            <Checkbox checked={remember} onCheckedChange={(v) => setRemember(!!v)} />
            <span>Zapamiętaj mnie na 30 dni</span>
          </label>

          <Button type="submit" className="w-full" size="lg">
            Odblokuj
          </Button>
        </div>
      </motion.form>
    </div>
  );
}
