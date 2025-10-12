// LoadingOverlay.tsx
import { Loader2 } from "lucide-react";

export default function Loading() {
  return (
    <div className="flex items-center justify-center py-10">
      <div className="flex flex-col items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-cyan-400" />
        <p className="text-white/80">Loading...</p>
      </div>
    </div>
  );
}
