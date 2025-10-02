// @ts-nocheck
"use client";

import React, { useEffect, useRef, useState, useCallback, useMemo } from "react";
import { Save } from "lucide-react";
import BaseModal from "@/src/components/shared/modal/BaseModal";
import InputText from "@/src/components/shared/input/InputText";
import clsx from "clsx";

type RoutingLine = {
  id: number;
  fg_code: string;
  op_no: number;
  work_center: string;
  std_time_min: number;
  setup_key?: string;
  remarks?: string;
};

type RoutingModalProps = {
  open: boolean;
  onClose: () => void;
  onSave: (payload: Omit<RoutingLine, "id"> & { id?: number }) => void;
  initial?: Partial<RoutingLine>;
  fgOptions?: string[];
  wcOptions?: string[];
};

export default function RoutingModal({
  open,
  onClose,
  onSave,
  initial,
  fgOptions = [],
  wcOptions = [],
}: RoutingModalProps) {
  const [fg, setFg] = useState("");
  const [op, setOp] = useState<number | "">("");
  const [wc, setWc] = useState("");
  const [std, setStd] = useState<number | "">("");
  const [setup, setSetup] = useState("");
  const [remarks, setRemarks] = useState("");

  const isEdit = useMemo(() => !!initial?.id, [initial?.id]);
  const initialFocusRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    setFg(initial?.fg_code ?? "");
    setOp(initial?.op_no ?? 10);
    setWc(initial?.work_center ?? "");
    setStd(initial?.std_time_min ?? "");
    setSetup(initial?.setup_key ?? "");
    setRemarks(initial?.remarks ?? "");
  }, [open, initial]);

  const canSave = fg.trim() && wc.trim() && Number(op) > 0 && Number(std) > 0;

  const handleSave = useCallback(() => {
    if (!canSave) return alert("กรอก FG / Op# / Work Center / Std Time ให้ครบ");

    onSave({
      id: initial?.id,
      fg_code: fg.trim(),
      op_no: Number(op),
      work_center: wc.trim(),
      std_time_min: Number(std),
      setup_key: setup.trim() || undefined,
      remarks: remarks.trim() || undefined,
    });
  }, [fg, op, wc, std, setup, remarks, initial?.id, canSave, onSave]);

  return (
    <BaseModal
      isOpen={open}
      onClose={onClose}
      onSave={handleSave}
      title={isEdit ? "Edit Routing" : "New Routing"}
      description="Routing line detail"
       footer={true}
      size="md"
      initialFocusRef={initialFocusRef}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* FG */}
        {fgOptions.length > 0 ? (
          <div>
            <label className="text-sm font-medium mb-1 block">FG *</label>
            <select
              className="w-full rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm"
              value={fg}
              onChange={(e) => setFg(e.target.value)}
            >
              <option value="">-- เลือก FG --</option>
              {fgOptions.map((f) => (
                <option key={f} value={f}>
                  {f}
                </option>
              ))}
            </select>
          </div>
        ) : (
          <InputText
            label="FG *"
            value={fg}
            onChange={setFg}
            placeholder="เช่น FG-100"
            inputRef={initialFocusRef}
          />
        )}

        {/* Operation No */}
        <InputText
          label="Op# *"
          type="number"
          value={op === "" ? "" : String(op)}
          onChange={(val) => setOp(val === "" ? "" : Number(val))}
          placeholder="เช่น 10, 20..."
        />

        {/* Work Center */}
        {wcOptions.length > 0 ? (
          <div>
            <label className="text-sm font-medium mb-1 block">Work Center *</label>
            <select
              className="w-full rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm"
              value={wc}
              onChange={(e) => setWc(e.target.value)}
            >
              <option value="">-- เลือก Work Center --</option>
              {wcOptions.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        ) : (
          <InputText
            label="Work Center *"
            value={wc}
            onChange={setWc}
            placeholder="เช่น CUT-01"
          />
        )}

        {/* Std Time */}
        <InputText
          label="Std Time (min) *"
          type="number"
          value={std === "" ? "" : String(std)}
          onChange={(val) => setStd(val === "" ? "" : Number(val))}
          placeholder="เวลาเป็นนาที"
        />

        {/* Setup Key */}
        <InputText
          label="Setup Key"
          value={setup}
          onChange={setSetup}
          placeholder="เช่น COLOR-BLUE / MODEL-A"
        />

        {/* Remarks */}
        <InputText
          label="Remarks"
          value={remarks}
          onChange={setRemarks}
          placeholder="หมายเหตุเพิ่มเติม"
        />
      </div>
    </BaseModal>
  );
}
