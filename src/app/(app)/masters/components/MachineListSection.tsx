// @ts-nocheck
import React from "react";
import SearchInput from "@/src/components/shared/input/SearchInput";
import IconButton from "@/src/components/shared/button/IconButton";
import { Plus, Edit3, Trash2 } from "lucide-react";
import CommonTable, { Column } from "@/src/components/shared/Table";
import { StatusBadge } from "@/src/components/shared/StatusBadge";

type Machine = {
  machine_id: string;
  machine_code: string;
  name: string;
  type: string;
  capabilities: string[];
  status: "active" | "down" | "standby";
  location_id: string;
  description: string;
  installation_date: string | null;
  purchase_date: string | null;
  last_maintenance_date: string | null;
  std_rate_min: number;
  capacity_unit: string;
  notes: string;
  created_at?: string;
  updated_at?: string;
};

type Props = {
  query: string;
  onQueryChange: (q: string) => void;
  data: Machine[];
  page: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onAdd: () => void;
};

const MachineListSection: React.FC<Props> = ({
  query,
  onQueryChange,
  data,
  page,
  pageSize,
  total,
  onPageChange,
  onPageSizeChange,
  onEdit,
  onDelete,
  onAdd,
}) => {
  const machineColumns = [
    {
      key: "action",
      header: "Action",
      className: "text-right",
      render: (m: Machine) => (
        <div className="flex justify-end gap-2">
          <IconButton buttonClassName="px-2 py-1" onClick={() => onEdit(m.machine_id)}>
            <Edit3 size={16} />
          </IconButton>
          <IconButton
            variant="warn"
            buttonClassName="px-2 py-1"
            onClick={() => onDelete(m.machine_id)}
          >
            <Trash2 size={16} />
          </IconButton>
        </div>
      ),
    },
    { key: "machine_code", header: "Code", render: (m: Machine) => <b>{m.machine_code}</b> },
    { key: "name", header: "Name", render: (m: Machine) => m.name || "-" },
    { key: "type", header: "Type", render: (m: Machine) => m.type || "-" },
    { key: "status", header: "Status", render: (m: Machine) => <StatusBadge status={m.status} /> },
    { key: "location_id", header: "Location", render: (m: Machine) => m.location_id || "-" },
    { key: "std_rate_min", header: "Std Rate", render: (m: Machine) => m.std_rate_min ?? "-" },
    { key: "capacity_unit", header: "Unit", render: (m: Machine) => m.capacity_unit || "-" },
  ] satisfies Column<Machine>[];

  return (
    <section>
      <div className="flex flex-wrap gap-2 items-center mb-3">
        <SearchInput
          value={query}
          onChange={onQueryChange}
          placeholder="ค้นหา machine_code / name / type / status"
        />
        <div className="ml-auto">
          <IconButton variant="add" label="New Machine" onClick={onAdd}>
            <Plus size={18} />
          </IconButton>
        </div>
      </div>

      <CommonTable<Machine>
        columns={machineColumns}
        data={data}
        pagination={{
          total,
          page,
          pageSize,
          onPageChange,
          onPageSizeChange,
          pageSizes: [10, 20, 50],
        }}
      />
    </section>
  );
};

export default MachineListSection;
