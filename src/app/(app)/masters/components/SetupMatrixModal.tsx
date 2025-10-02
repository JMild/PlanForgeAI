// @ts-nocheck
import BaseModal from "@/src/components/shared/modal/BaseModal";
import { useState } from "react";
import { useEffect } from "react";

type SetupMatrixLine = { id: number; from: string; to: string; minutes: number; };
export type SetupMatrixPayload = Omit<SetupMatrixLine, "id"> & { id?: number };

export default function PSetupMatrixModal({
  open,
  initial,
  onClose,
  onSave,
}: {
  open: boolean;
  initial?: SetupMatrixLine;
  onClose: () => void;
  onSave: (payload: SetupMatrixPayload) => void;
}) {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [minutes, setMinutes] = useState<number>(0);

  useEffect(() => {
    if (!open) return;
    setFrom(initial?.from ?? "");
    setTo(initial?.to ?? "");
    setMinutes(initial?.minutes ?? 0);
  }, [open, initial]);

  const canSave = from.trim() && to.trim() && minutes > 0;

  return (
    <BaseModal
      isOpen={open}
      onClose={onClose}
      onSave={() => {
        if (!canSave) {
          alert("กรุณากรอกข้อมูลให้ครบถ้วน");
          return;
        }

        onSave({
          id: initial?.id,
          from: from.trim(),
          to: to.trim(),
          minutes,
        });
      }}
      title={initial?.id ? "Edit Setup Line" : "New Setup Line"}
      footer
      size="sm"
    >
      <div className="space-y-4">
        <div>
          <label className="block text-sm mb-1">From *</label>
          <input
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            className="w-full rounded border px-2 py-1 dark:bg-slate-800 dark:border-slate-700"
          />
        </div>
        <div>
          <label className="block text-sm mb-1">To *</label>
          <input
            value={to}
            onChange={(e) => setTo(e.target.value)}
            className="w-full rounded border px-2 py-1 dark:bg-slate-800 dark:border-slate-700"
          />
        </div>
        <div>
          <label className="block text-sm mb-1">Setup (min) *</label>
          <input
            type="number"
            value={minutes}
            onChange={(e) => setMinutes(Number(e.target.value))}
            className="w-full rounded border px-2 py-1 dark:bg-slate-800 dark:border-slate-700"
          />
        </div>
      </div>
    </BaseModal>
  );
}
