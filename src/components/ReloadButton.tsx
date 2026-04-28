import { DownloadCloud } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ReloadButton() {
  const handleReload = () => {
    window.location.href = window.location.pathname + "?v=" + new Date().getTime();
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={handleReload}
      title="Pobierz najnowszą wersję"
      aria-label="Pobierz najnowszą wersję"
    >
      <DownloadCloud className="w-4 h-4" />
    </Button>
  );
}
