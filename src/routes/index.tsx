import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Toaster } from "@/components/ui/sonner";
import { SupabaseSetup } from "@/components/SupabaseSetup";
import { LockScreen } from "@/components/LockScreen";
import { Dashboard } from "@/components/Dashboard";
import { ItemsView } from "@/components/ItemsView";
import { getSupabaseConfig, clearSupabaseConfig, Location } from "@/lib/supabaseClient";
import { isAuthed, logout } from "@/lib/auth";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  const [hasConfig, setHasConfig] = useState(() => !!getSupabaseConfig());
  const [authed, setAuthed] = useState(() => isAuthed());
  const [activeLocation, setActiveLocation] = useState<Location | null>(null);

  if (!hasConfig) {
    return (
      <>
        <SupabaseSetup onReady={() => setHasConfig(true)} />
        <Toaster theme="dark" />
      </>
    );
  }

  if (!authed) {
    return (
      <>
        <LockScreen onUnlock={() => setAuthed(true)} />
        <Toaster theme="dark" />
      </>
    );
  }

  return (
    <>
      <AnimatePresence mode="wait">
        {activeLocation ? (
          <motion.div
            key="items"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
          >
            <ItemsView location={activeLocation} onBack={() => setActiveLocation(null)} />
          </motion.div>
        ) : (
          <motion.div
            key="dash"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <Dashboard
              onOpen={setActiveLocation}
              onLogout={() => { logout(); setAuthed(false); }}
              onResetConfig={() => {
                if (confirm("Rozłączyć z Supabase i wyczyścić konfigurację?")) {
                  clearSupabaseConfig();
                  setHasConfig(false);
                }
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>
      <Toaster theme="dark" />
    </>
  );
}
