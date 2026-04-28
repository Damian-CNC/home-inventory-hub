import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, Plus, Search, Trash2, Loader2, Tag, ArrowUpDown, Pencil,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { getSupabase, Item, ItemType, Location } from "@/lib/supabaseClient";
import { ReloadButton } from "./ReloadButton";
import { toast } from "sonner";

type SortKey = "name" | "quantity" | "created_at";

export function ItemsView({ location, onBack }: { location: Location; onBack: () => void }) {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<SortKey>("created_at");

  // form state
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [type, setType] = useState<ItemType>("count");
  const [quantity, setQuantity] = useState("");
  const [unit, setUnit] = useState("szt");
  const [capacity, setCapacity] = useState("");
  const [tags, setTags] = useState("");

  const load = async () => {
    const sb = getSupabase()!;
    setLoading(true);
    const { data, error } = await sb
      .from("items").select("*").eq("location_id", location.id);
    if (error) toast.error(error.message);
    setItems(data ?? []);
    setLoading(false);
  };

  useEffect(() => { load(); }, [location.id]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return [...items]
      .filter((i) => i.name.toLowerCase().includes(q) || i.tags.some((t) => t.toLowerCase().includes(q)))
      .sort((a, b) => {
        if (sort === "name") return a.name.localeCompare(b.name);
        if (sort === "quantity") return b.quantity - a.quantity;
        return (b.created_at ?? "").localeCompare(a.created_at ?? "");
      });
  }, [items, search, sort]);

  const resetForm = () => {
    setName(""); setType("count"); setQuantity(""); setUnit("szt"); setCapacity(""); setTags("");
  };

  const add = async () => {
    if (!name.trim() || !quantity) return;
    const sb = getSupabase()!;
    const finalUnit = type === "weight" ? "g" : type === "liquid" ? "ml" : unit || "szt";
    const payload = {
      location_id: location.id,
      name: name.trim(),
      quantity: Number(quantity),
      unit: finalUnit,
      total_capacity: type === "liquid" ? Number(capacity || quantity) : null,
      type,
      tags: tags.split(",").map((t) => t.trim()).filter(Boolean),
    };
    const { error } = await sb.from("items").insert(payload);
    if (error) return toast.error(error.message);
    toast.success("Dodano przedmiot");
    setOpen(false); resetForm(); load();
  };

  const updateQty = async (item: Item, newQty: number) => {
    const sb = getSupabase()!;
    const q = Math.max(0, newQty);
    setItems((prev) => prev.map((i) => i.id === item.id ? { ...i, quantity: q } : i));
    const { error } = await sb.from("items").update({ quantity: q }).eq("id", item.id);
    if (error) { toast.error(error.message); load(); }
  };

  const saveEdit = async (id: string, patch: Partial<Item>) => {
    const sb = getSupabase()!;
    setItems((prev) => prev.map((i) => i.id === id ? { ...i, ...patch } as Item : i));
    const { error } = await sb.from("items").update(patch).eq("id", id);
    if (error) { toast.error(error.message); load(); return false; }
    toast.success("Zapisano zmiany");
    return true;
  };

  const remove = async (id: string) => {
    const sb = getSupabase()!;
    setItems((prev) => prev.filter((i) => i.id !== id));
    const { error } = await sb.from("items").delete().eq("id", id);
    if (error) { toast.error(error.message); load(); }
  };

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-10 backdrop-blur-xl bg-background/70 border-b border-border">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={onBack}><ArrowLeft className="w-4 h-4" /></Button>
          <div className="flex-1">
            <h1 className="text-lg font-semibold tracking-tight">{location.name}</h1>
            <p className="text-xs text-muted-foreground">{items.length} przedmiotów</p>
          </div>
          <ReloadButton />
          <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) resetForm(); }}>
            <DialogTrigger asChild>
              <Button size="sm"><Plus className="w-4 h-4 mr-1" /> Dodaj</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Nowy przedmiot</DialogTitle></DialogHeader>
              <div className="space-y-4 py-2">
                <div className="space-y-2">
                  <Label>Nazwa</Label>
                  <Input value={name} onChange={(e) => setName(e.target.value)} autoFocus />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label>Typ</Label>
                    <Select value={type} onValueChange={(v) => setType(v as ItemType)}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="count">Sztuki</SelectItem>
                        <SelectItem value="weight">Waga (g)</SelectItem>
                        <SelectItem value="liquid">Płyn / Sypkie (ml/g)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>{type === "liquid" ? "Aktualna ilość" : type === "weight" ? "Waga (g)" : "Ilość"}</Label>
                    <Input type="number" value={quantity} onChange={(e) => setQuantity(e.target.value)} />
                  </div>
                </div>
                {type === "liquid" && (
                  <div className="space-y-2">
                    <Label>Pojemność opakowania (np. 1000 dla 1L)</Label>
                    <Input type="number" value={capacity} onChange={(e) => setCapacity(e.target.value)} placeholder="1000" />
                  </div>
                )}
                {type === "count" && (
                  <div className="space-y-2">
                    <Label>Jednostka</Label>
                    <Input value={unit} onChange={(e) => setUnit(e.target.value)} placeholder="szt" />
                  </div>
                )}
                <div className="space-y-2">
                  <Label>Tagi (oddzielone przecinkiem)</Label>
                  <Input value={tags} onChange={(e) => setTags(e.target.value)} placeholder="mięso, obiad" />
                </div>
              </div>
              <DialogFooter><Button onClick={add}>Dodaj</Button></DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
        <div className="max-w-4xl mx-auto px-6 pb-4 flex gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Szukaj..." className="pl-9" />
          </div>
          <Select value={sort} onValueChange={(v) => setSort(v as SortKey)}>
            <SelectTrigger className="w-44"><ArrowUpDown className="w-4 h-4 mr-1" /><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="created_at">Najnowsze</SelectItem>
              <SelectItem value="name">Nazwa</SelectItem>
              <SelectItem value="quantity">Ilość</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-6">
        {loading ? (
          <div className="flex justify-center py-20"><Loader2 className="animate-spin text-muted-foreground" /></div>
        ) : (
          <motion.ul layout className="space-y-3">
            <AnimatePresence>
              {filtered.map((item) => (
                <ItemRow key={item.id} item={item} onUpdate={updateQty} onRemove={remove} onSaveEdit={saveEdit} />
              ))}
            </AnimatePresence>
            {filtered.length === 0 && (
              <p className="text-center text-sm text-muted-foreground py-12">Brak przedmiotów.</p>
            )}
          </motion.ul>
        )}
      </main>
    </div>
  );
}

function ItemRow({
  item, onUpdate, onRemove, onSaveEdit,
}: {
  item: Item;
  onUpdate: (i: Item, q: number) => void;
  onRemove: (id: string) => void;
  onSaveEdit: (id: string, patch: Partial<Item>) => Promise<boolean>;
}) {
  const [editOpen, setEditOpen] = useState(false);
  const [eName, setEName] = useState(item.name);
  const [eQty, setEQty] = useState(String(item.quantity));
  const [eCap, setECap] = useState(item.total_capacity ? String(item.total_capacity) : "");
  const [eUnit, setEUnit] = useState(item.unit);
  const [saving, setSaving] = useState(false);

  const openEdit = () => {
    setEName(item.name);
    setEQty(String(item.quantity));
    setECap(item.total_capacity ? String(item.total_capacity) : "");
    setEUnit(item.unit);
    setEditOpen(true);
  };

  const handleSave = async () => {
    if (!eName.trim() || eQty === "") return;
    setSaving(true);
    const patch: Partial<Item> = {
      name: eName.trim(),
      quantity: Number(eQty),
      unit: eUnit || item.unit,
      total_capacity: eCap ? Number(eCap) : null,
    };
    const ok = await onSaveEdit(item.id, patch);
    setSaving(false);
    if (ok) setEditOpen(false);
  };

  return (
    <motion.li
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="bg-card border border-border rounded-xl p-4"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-medium truncate">{item.name}</h3>
            <span className="text-sm text-muted-foreground">
              {item.quantity}{item.unit}
              {item.type === "liquid" && item.total_capacity ? ` / ${item.total_capacity}${item.unit}` : ""}
            </span>
          </div>
          {item.tags.length > 0 && (
            <div className="flex gap-1.5 mt-1.5 flex-wrap">
              {item.tags.map((t) => (
                <Badge key={t} variant="secondary" className="text-xs gap-1">
                  <Tag className="w-3 h-3" />{t}
                </Badge>
              ))}
            </div>
          )}
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" onClick={openEdit} className="text-muted-foreground hover:text-foreground">
            <Pencil className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => onRemove(item.id)} className="text-muted-foreground hover:text-destructive">
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
          >
            <DialogHeader><DialogTitle>Edytuj: {item.name}</DialogTitle></DialogHeader>
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <Label>Nazwa</Label>
                <Input value={eName} onChange={(e) => setEName(e.target.value)} autoFocus />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>Aktualna ilość</Label>
                  <Input type="number" value={eQty} onChange={(e) => setEQty(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Jednostka</Label>
                  <Select value={eUnit} onValueChange={setEUnit}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="szt">szt</SelectItem>
                      <SelectItem value="ml">ml</SelectItem>
                      <SelectItem value="l">l</SelectItem>
                      <SelectItem value="g">g</SelectItem>
                      <SelectItem value="kg">kg</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Całkowita pojemność (puste = brak pasków)</Label>
                <Input
                  type="number"
                  value={eCap}
                  onChange={(e) => setECap(e.target.value)}
                  placeholder="np. 1000"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditOpen(false)}>Anuluj</Button>
              <Button onClick={handleSave} disabled={saving}>
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : "Zapisz"}
              </Button>
            </DialogFooter>
          </motion.div>
        </DialogContent>
      </Dialog>

      {item.type === "liquid" && item.total_capacity && (
        <CapacityBars current={item.quantity} total={item.total_capacity} />
      )}

      <QuickActions item={item} onUpdate={onUpdate} />
    </motion.li>
  );
}

function CapacityBars({ current, total }: { current: number; total: number }) {
  const pct = Math.max(0, Math.min(1, current / total));
  const filled = Math.round(pct * 4);
  return (
    <div className="mt-3 grid grid-cols-4 gap-1.5">
      {[0, 1, 2, 3].map((i) => (
        <motion.div
          key={i}
          initial={false}
          animate={{ backgroundColor: i < filled ? "var(--bar-full)" : "var(--bar-empty)" }}
          transition={{ duration: 0.3 }}
          className="h-2 rounded-full"
        />
      ))}
    </div>
  );
}

function QuickActions({ item, onUpdate }: { item: Item; onUpdate: (i: Item, q: number) => void }) {
  const presets =
    item.type === "weight" ? [50, 100, 200] :
    item.type === "liquid" ? [100, 250, 500] :
    [1, 5];

  return (
    <div className="mt-3 flex flex-wrap gap-2">
      {presets.map((p) => (
        <Button
          key={p}
          variant="outline"
          size="sm"
          onClick={() => onUpdate(item, item.quantity - p)}
          className="text-xs"
        >
          −{p}{item.unit}
        </Button>
      ))}
      <Button
        variant="outline"
        size="sm"
        onClick={() => {
          const v = prompt(`Odejmij ile ${item.unit}?`);
          if (v) onUpdate(item, item.quantity - Number(v));
        }}
        className="text-xs"
      >
        Inna...
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={() => onUpdate(item, item.quantity + 1)}
        className="text-xs"
      >
        +1
      </Button>
    </div>
  );
}
