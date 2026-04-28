import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Trash2, LogOut, Settings, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter,
} from "@/components/ui/dialog";
import { Icon, ICON_NAMES } from "./Icon";
import { ReloadButton } from "./ReloadButton";
import { getSupabase, Location } from "@/lib/supabaseClient";
import { toast } from "sonner";

type Props = {
  onOpen: (loc: Location) => void;
  onLogout: () => void;
  onResetConfig: () => void;
};

export function Dashboard({ onOpen, onLogout, onResetConfig }: Props) {
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [icon, setIcon] = useState("Refrigerator");

  const load = async () => {
    const sb = getSupabase();
    if (!sb) return;
    setLoading(true);
    const { data, error } = await sb.from("locations").select("*").order("created_at");
    if (error) toast.error("Błąd: " + error.message);
    setLocations(data ?? []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const add = async () => {
    if (!name.trim()) return;
    const sb = getSupabase()!;
    const { error } = await sb.from("locations").insert({ name: name.trim(), icon });
    if (error) return toast.error(error.message);
    setName(""); setIcon("Refrigerator"); setOpen(false);
    toast.success("Dodano lokację");
    load();
  };

  const remove = async (id: string) => {
    if (!confirm("Usunąć tę lokację wraz z przedmiotami?")) return;
    const sb = getSupabase()!;
    const { error } = await sb.from("locations").delete().eq("id", id);
    if (error) return toast.error(error.message);
    load();
  };

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-10 backdrop-blur-xl bg-background/70 border-b border-border">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold tracking-tight">Home Organizer</h1>
            <p className="text-xs text-muted-foreground">Twoje lokacje</p>
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" size="icon" onClick={onResetConfig} title="Konfiguracja">
              <Settings className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={onLogout} title="Wyloguj">
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8">
        {loading ? (
          <div className="flex justify-center py-20"><Loader2 className="animate-spin text-muted-foreground" /></div>
        ) : (
          <motion.div
            layout
            className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4"
          >
            <AnimatePresence>
              {locations.map((loc) => (
                <motion.button
                  key={loc.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  whileHover={{ y: -4 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => onOpen(loc)}
                  className="group relative aspect-square bg-card border border-border rounded-2xl p-5 flex flex-col items-start justify-between text-left hover:border-primary/50 transition-colors"
                >
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Icon name={loc.icon} className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <div className="font-medium">{loc.name}</div>
                  </div>
                  <span
                    role="button"
                    onClick={(e) => { e.stopPropagation(); remove(loc.id); }}
                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-lg hover:bg-destructive/20 text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="w-4 h-4" />
                  </span>
                </motion.button>
              ))}
            </AnimatePresence>

            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <motion.button
                  whileHover={{ y: -4 }}
                  whileTap={{ scale: 0.97 }}
                  className="aspect-square border-2 border-dashed border-border rounded-2xl flex flex-col items-center justify-center gap-2 text-muted-foreground hover:border-primary hover:text-primary transition-colors"
                >
                  <Plus className="w-8 h-8" />
                  <span className="text-sm">Dodaj lokację</span>
                </motion.button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>Nowa lokacja</DialogTitle></DialogHeader>
                <div className="space-y-4 py-2">
                  <div className="space-y-2">
                    <Label>Nazwa</Label>
                    <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="np. Zamrażarka" autoFocus />
                  </div>
                  <div className="space-y-2">
                    <Label>Ikona</Label>
                    <div className="grid grid-cols-8 gap-2">
                      {ICON_NAMES.map((n) => (
                        <button
                          key={n}
                          type="button"
                          onClick={() => setIcon(n)}
                          className={`aspect-square rounded-lg flex items-center justify-center border transition-colors ${
                            icon === n ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:border-primary/50"
                          }`}
                        >
                          <Icon name={n} className="w-5 h-5" />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button onClick={add}>Dodaj</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </motion.div>
        )}

        {!loading && locations.length === 0 && (
          <p className="text-center text-sm text-muted-foreground mt-6">
            Zacznij od dodania pierwszej lokacji.
          </p>
        )}
      </main>
    </div>
  );
}
