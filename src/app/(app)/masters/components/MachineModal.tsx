import React, { useState, useEffect, KeyboardEvent } from "react";
import { X } from "lucide-react";
import InputText from "@/src/components/shared/input/InputText";
import BaseModal from "@/src/components/shared/modal/BaseModal";
import TextArea from "@/src/components/shared/input/Textarea";
import Dropdown from "@/src/components/shared/input/Dropdown";

type Machine = {
  id?: string;
  machine_id?: string;
  machine_code?: string;
  name?: string;
  type?: string;
  status?: string;
  location_id?: string;
  std_rate_min?: number;
  capacity_unit?: string;
  installation_date?: string | null;
  purchase_date?: string | null;
  last_maintenance?: string | null;
  notes?: string;
  description?: string;
  capabilities?: string[];
};

type Props = {
  isOpen: boolean;
  onClose: () => void;
  machine?: Machine | null;
  capabilities: string[];
  onSave: (machine: Machine, capabilities: string[]) => void;
  onRemoveCapability: (cap: string) => void;
};

 const statusOptions = [
  { label: "active", value: "active" },
  { label: "down", value: "down" },
  { label: "standby", value: "standby" },
];

export default function MachineModal({
  isOpen,
  onClose,
  machine,
  capabilities,
  onSave,
  onRemoveCapability,
}: Props) {
  const [mmId, setMmId] = useState("");
  const [mmCode, setMmCode] = useState("");
  const [mmName, setMmName] = useState("");
  const [mmType, setMmType] = useState("");
  const [mmStatus, setMmStatus] = useState("active");
  const [mmLoc, setMmLoc] = useState("");
  const [mmStd, setMmStd] = useState<number | "">("");
  const [mmCapUnit, setMmCapUnit] = useState("");
  const [mmIns, setMmIns] = useState<string | null>(null);
  const [mmPur, setMmPur] = useState<string | null>(null);
  const [mmLast, setMmLast] = useState<string | null>(null);
  const [mmNotes, setMmNotes] = useState("");
  const [mmDesc, setMmDesc] = useState("");
  const [capList, setCapList] = useState<string[]>([]);

  useEffect(() => {
    setMmId(machine?.machine_id || "");
    setMmCode(machine?.machine_code || "");
    setMmName(machine?.name || "");
    setMmType(machine?.type || "");
    setMmStatus(machine?.status || "active");
    setMmLoc(machine?.location_id || "");
    setMmStd(machine?.std_rate_min ?? "");
    setMmCapUnit(machine?.capacity_unit || "");
    setMmIns(machine?.installation_date || null);
    setMmPur(machine?.purchase_date || null);
    setMmLast(machine?.last_maintenance || null);
    setMmNotes(machine?.notes || "");
    setMmDesc(machine?.description || "");
    setCapList(machine?.capabilities || []);
  }, [machine]);

  const handleSave = () => {
    onSave(
      {
        machine_id: mmId,
        machine_code: mmCode,
        name: mmName,
        type: mmType,
        status: mmStatus,
        location_id: mmLoc,
        std_rate_min: typeof mmStd === "number" ? mmStd : undefined,
        capacity_unit: mmCapUnit,
        installation_date: mmIns,
        purchase_date: mmPur,
        last_maintenance: mmLast,
        notes: mmNotes,
        description: mmDesc,
      },
      capList
    );
  };

  const footer = (
    <>
      <button
        className="px-4 py-2 bg-slate-100 text-slate-700 rounded-md hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 transition"
        onClick={onClose}
      >
        Cancel
      </button>
      <button
        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
        onClick={handleSave}
      >
        Save
      </button>
    </>
  );

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title={machine?.machine_id ? "Edit Machine" : "New Machine"}
      size="lg"
      footer={footer}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <InputText
          label="Machine ID"
          value={mmId}
          onChange={setMmId}
          placeholder="MCH-001"
        />
        <InputText
          label="Machine Code"
          value={mmCode}
          onChange={setMmCode}
          placeholder="CNCL-3000-01"
        />
        <InputText
          label="Name"
          value={mmName}
          onChange={setMmName}
          placeholder="CNC Lathe 3000"
        />
        <InputText
          label="Type"
          value={mmType}
          onChange={setMmType}
          placeholder="CNC Lathe"
        />

        <Dropdown
          label="Status"
          value={mmStatus}
          onChange={setMmStatus}
          options={statusOptions}
          placeholder="All Status"
          className="h-10"
        />

        <InputText
          label="Location ID"
          value={mmLoc}
          onChange={setMmLoc}
          placeholder="LOC-001"
        />
        <InputText
          label="Std Rate (min)"
          type="number"
          value={mmStd === "" ? "" : String(mmStd)}
          onChange={(val) => setMmStd(val === "" ? "" : Number(val))}
          placeholder="30"
        />
        <InputText
          label="Capacity Unit"
          value={mmCapUnit}
          onChange={setMmCapUnit}
          placeholder="pcs/hour"
        />
        <InputText
          label="Installation Date"
          value={mmIns}
          onChange={setMmIns}
          type="date"
        />
        <InputText
          label="Purchase Date"
          value={mmPur}
          onChange={setMmPur}
          type="date"
        />
        <InputText
          label="Last Maintenance"
          value={mmLast}
          onChange={setMmLast}
          type="date"
        />
      </div>

      <TextArea
        label="Notes"
        value={mmNotes}
        onChange={setMmNotes}
        placeholder="Requires calibration every 6 months"
        rows={2}
        required
      />

      <div className="mt-4">
        <TextArea
          label="Description"
          value={mmDesc}
          onChange={setMmDesc}
          placeholder="Machine description"
          rows={1}
          required
        />      
      </div>
    </BaseModal>
  );
}
