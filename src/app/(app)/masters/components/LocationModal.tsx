import { CancelButton, SaveButton } from "@/src/components/shared/button/ActionButtons";
import { useEffect, useState } from "react";

type Warehouse = {
  id: number;
  code: string;                 // e.g. "RM-A"
  name: string;                 // e.g. "Raw A"
  policy?: "FIFO" | "LIFO" | "FEFO" | "None";
  location?: string;            // site / address
  capacity?: string;            // e.g. "50 pallets" / "2,000 m²"
  remarks?: string;
  active?: boolean;
};

export default function WarehouseModal({
  open,
  onClose,
  onSave,
  initial,
}: {
  open: boolean;
  onClose: () => void;
  onSave: (payload: Omit<Warehouse, "id"> & { id?: number }) => void;
  initial?: Partial<Warehouse>;
}) {
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [policy, setPolicy] = useState<Warehouse["policy"]>("FIFO");
  const [location, setLocation] = useState("");
  const [capacity, setCapacity] = useState("");
  const [remarks, setRemarks] = useState("");
  const [active, setActive] = useState(true);

  useEffect(() => {
    if (!open) return;
    setCode(initial?.code ?? "");
    setName(initial?.name ?? "");
    setPolicy(initial?.policy ?? "FIFO");
    setLocation(initial?.location ?? "");
    setCapacity(initial?.capacity ?? "");
    setRemarks(initial?.remarks ?? "");
    setActive(initial?.active ?? true);
  }, [open, initial]);

  const canSave = code.trim() && name.trim();

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-3xl rounded-xl bg-white text-slate-900 shadow-xl dark:bg-slate-900 dark:text-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-3 dark:border-slate-800">
          <div className="text-lg font-bold">{initial?.id ? "Edit Warehouse" : "New Warehouse"}</div>
          <button className="rounded-md p-2 hover:bg-slate-100 dark:hover:bg-slate-800" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="px-5 py-4">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-semibold">Loc Code *</label>
              <input
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 dark:border-slate-700 dark:bg-slate-800"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="เช่น RM-A / FG-1"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-semibold">Name *</label>
              <input
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 dark:border-slate-700 dark:bg-slate-800"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Raw A / FG Main"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-semibold">Policy</label>
              <select
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 dark:border-slate-700 dark:bg-slate-800"
                value={policy ?? "None"}
                onChange={(e) => setPolicy(e.target.value as Warehouse["policy"])}
              >
                {["FIFO", "LIFO", "FEFO", "None"].map((p) => (
                  <option key={p} value={p as any}>{p}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-semibold">Location</label>
              <input
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 dark:border-slate-700 dark:bg-slate-800"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Site A / Address"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-semibold">Capacity</label>
              <input
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 dark:border-slate-700 dark:bg-slate-800"
                value={capacity}
                onChange={(e) => setCapacity(e.target.value)}
                placeholder="เช่น 60 pallets / 2,000 m²"
              />
            </div>
            <div className="md:col-span-2">
              <label className="mb-1 block text-sm font-semibold">Remarks</label>
              <input
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 dark:border-slate-700 dark:bg-slate-800"
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                placeholder="โน้ตอื่น ๆ"
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                id="wh-active"
                type="checkbox"
                checked={active}
                onChange={(e) => setActive(e.target.checked)}
              />
              <label htmlFor="wh-active" className="text-sm">Active</label>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 border-t border-slate-200 px-5 py-3 dark:border-slate-800">
          <CancelButton onClick={onClose}/>
          <SaveButton onClick={() => {
              if (!canSave) return alert("กรอก Loc Code และ Name ให้ครบ");
              onSave({
                id: initial?.id,
                code: code.trim(),
                name: name.trim(),
                policy: policy ?? "None",
                location: location.trim() || undefined,
                capacity: capacity.trim() || undefined,
                remarks: remarks.trim() || undefined,
                active,
              });
            }}/>          
        </div>
      </div>
    </div>
  );
}