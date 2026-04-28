import { useEffect, useMemo, useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { getSupabase } from "@/lib/supabaseClient";

type Props = {
  value: string;
  onChange: (v: string) => void;
  autoFocus?: boolean;
  placeholder?: string;
};

let cachedNames: string[] | null = null;
let inflight: Promise<string[]> | null = null;

async function fetchUniqueNames(): Promise<string[]> {
  if (cachedNames) return cachedNames;
  if (inflight) return inflight;
  const sb = getSupabase();
  if (!sb) return [];
  inflight = (async () => {
    const { data, error } = await sb.from("items").select("name");
    if (error || !data) return [];
    const set = new Set<string>();
    for (const r of data as { name: string }[]) {
      if (r.name && r.name.trim()) set.add(r.name.trim());
    }
    const arr = Array.from(set).sort((a, b) => a.localeCompare(b));
    cachedNames = arr;
    return arr;
  })();
  const result = await inflight;
  inflight = null;
  return result;
}

export function invalidateNameCache() {
  cachedNames = null;
}

export function NameAutocomplete({ value, onChange, autoFocus, placeholder }: Props) {
  const [names, setNames] = useState<string[]>([]);
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchUniqueNames().then(setNames);
  }, []);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const suggestions = useMemo(() => {
    const q = value.trim().toLowerCase();
    if (!q) return [];
    return names
      .filter((n) => n.toLowerCase().includes(q) && n.toLowerCase() !== q)
      .slice(0, 20);
  }, [value, names]);

  const showDropdown = open && suggestions.length > 0;

  return (
    <div ref={wrapRef} className="relative">
      <Input
        value={value}
        onChange={(e) => { onChange(e.target.value); setOpen(true); }}
        onFocus={() => setOpen(true)}
        autoFocus={autoFocus}
        placeholder={placeholder}
      />
      {showDropdown && (
        <ul className="absolute z-50 left-0 right-0 mt-1 max-h-48 overflow-y-auto rounded-md border border-border bg-popover text-popover-foreground shadow-lg">
          {suggestions.map((s) => (
            <li
              key={s}
              onMouseDown={(e) => {
                e.preventDefault();
                onChange(s);
                setOpen(false);
              }}
              className="px-3 py-2 text-sm cursor-pointer hover:bg-accent hover:text-accent-foreground"
            >
              {s}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
