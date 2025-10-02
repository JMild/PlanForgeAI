"use client";

import React, {
  useEffect,
  useMemo,
  useRef,
  useState,
  useCallback,
} from "react";
import BaseModal from "@/src/components/shared/modal/BaseModal";
import InputText from "@/src/components/shared/input/InputText";

export type BomLine = {
  id: number | null;
  fg_code: string;
  component_code: string;
  usage: number;
  unit_code?: string;
  substitute?: string;
  scrap_pct?: number;
  remarks?: string;
};

type ThemeMode = "auto" | "light" | "dark";

type BomModalProps = {
  isOpen: boolean;
  onClose: () => void;
  bom?: Partial<BomLine>;
  onSave: (payload: BomLine) => void;
  fgOptions?: string[];
  unitOptions?: string[];
  theme?: ThemeMode;
};

const BomModal: React.FC<BomModalProps> = ({
  isOpen,
  onClose,
  bom,
  onSave,
  fgOptions = [],
  unitOptions = ["pcs"],
}) => {
  const [fgCode, setFgCode] = useState("");
  const [comp, setComp] = useState("");
  const [usage, setUsage] = useState<number | "">("");
  const [unit, setUnit] = useState(unitOptions[0] ?? "pcs");
  const [sub, setSub] = useState("");
  const [scrap, setScrap] = useState<number | "">("");
  const [remarks, setRemarks] = useState("");

  const isEdit = useMemo(() => !!bom?.id, [bom]);
  const initialFocusRef = useRef<HTMLInputElement>(null);

  const resetForm = useCallback(() => {
    setFgCode(bom?.fg_code ?? "");
    setComp(bom?.component_code ?? "");
    setUsage(bom?.usage ?? "");
    setUnit(bom?.unit_code ?? unitOptions[0] ?? "pcs");
    setSub(bom?.substitute ?? "");
    setScrap(bom?.scrap_pct ?? "");
    setRemarks(bom?.remarks ?? "");
  }, [bom, unitOptions]);

  useEffect(() => {
    if (isOpen) resetForm();
  }, [isOpen, resetForm]);

  const canSave =
    fgCode.trim().length > 0 &&
    comp.trim().length > 0 &&
    typeof usage === "number" &&
    usage > 0;

  const handleSave = useCallback(() => {
    if (!canSave) return alert("กรอก FG / Component / Usage ให้ครบถ้วน");

    onSave({
      id: bom?.id ?? null,
      fg_code: fgCode.trim(),
      component_code: comp.trim(),
      usage: typeof usage === "number" ? usage : 0,
      unit_code: unit.trim(),
      substitute: sub.trim() || undefined,
      scrap_pct: typeof scrap === "number" ? scrap : undefined,
      remarks: remarks.trim() || undefined,
    });
  }, [bom?.id, fgCode, comp, usage, unit, sub, scrap, remarks, canSave, onSave]);

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      onSave={handleSave}
      title={isEdit ? "Edit BOM Line" : "New BOM Line"}
      description="Specify Bill of Material Line"
      footer={true}
      size="md"
    // initialFocusRef={initialFocusRef}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* FG Code */}
        {fgOptions.length > 0 ? (
          <div>
            <label className="text-sm font-medium text-slate-700 dark:text-slate-200 mb-1 block">
              FG *
            </label>
            <select
              className="w-full rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm"
              value={fgCode}
              onChange={(e) => setFgCode(e.target.value)}
            >
              <option value="">-- เลือก FG --</option>
              {fgOptions.map((fg) => (
                <option key={fg} value={fg}>
                  {fg}
                </option>
              ))}
            </select>
          </div>
        ) : (
          <InputText
            label="FG *"
            value={fgCode}
            onChange={setFgCode}
            placeholder="เช่น ELEC-001"
            innerRef={initialFocusRef}
          />
        )}

        <InputText
          label="Component *"
          value={comp}
          onChange={setComp}
          placeholder="เช่น RM-010"
        />

        <InputText
          label="Usage *"
          type="number"
          value={usage === "" ? "" : String(usage)}
          onChange={(val) => setUsage(val === "" ? "" : Number(val))}
          placeholder="เช่น 2.5"
        />

        {unitOptions.length > 0 ? (
          <div>
            <label className="text-sm font-medium text-slate-700 dark:text-slate-200 mb-1 block">
              Unit
            </label>
            <select
              className="w-full rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm"
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
            >
              {unitOptions.map((u) => (
                <option key={u} value={u}>
                  {u}
                </option>
              ))}
            </select>
          </div>
        ) : (
          <InputText
            label="Unit"
            value={unit}
            onChange={setUnit}
            placeholder="pcs / kg / m"
          />
        )}

        <InputText
          label="Substitute"
          value={sub}
          onChange={setSub}
          placeholder="เช่น RM-011 (optional)"
        />

        <InputText
          label="Scrap %"
          type="number"
          value={scrap === "" ? "" : String(scrap)}
          onChange={(val) => setScrap(val === "" ? "" : Number(val))}
          placeholder="เช่น 1 หรือ 2.5"
        />
      </div>

      <div className="mt-4">
        <label className="text-sm font-medium text-slate-700 dark:text-slate-200 mb-1 block">
          Remarks
        </label>
        <textarea
          rows={3}
          className="resize-none block w-full rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm"
          value={remarks}
          onChange={(e) => setRemarks(e.target.value)}
          placeholder="โน้ตเพิ่มเติม (optional)"
        />
      </div>
    </BaseModal>
  );
};

export default BomModal;
