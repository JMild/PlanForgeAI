// LoadingOverlay.tsx
import { Loader2 } from "lucide-react";

export default function Loading({ text = "Loading..." }: { text?: string }) {
  return (
    <div className="rounded-xl border border-white/15 bg-white/10 backdrop-blur">
      <div className="overflow-x-auto rounded-lg border border-white/10 bg-white/5">
        <div className="flex items-center justify-center h-[300px]">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="w-12 h-12 animate-spin text-cyan-400" />
            <p className="text-white/80">{text}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
