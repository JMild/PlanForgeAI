"use client";

import React, { useEffect, useState } from "react";
import BaseModal from "@/src/components/shared/modal/BaseModal";
import InputText from "@/src/components/shared/input/InputText";
import Dropdown from "@/src/components/shared/input/Dropdown";
import TextArea from "@/src/components/shared/input/Textarea";

type Status = "pending" | "released" | "completed" | "cancelled";

type Order = {
  id?: number;
  order_number?: string;
  customer_id?: string;
  due_date?: string | null;
  status?: Status;
  remarks?: string;
};

type OrderModalProps = {
  isOpen: boolean;
  onClose: () => void;
  order?: Order | null;
  onSave: (order: Order) => void;
};

const statusOptions = [
  { label: "Pending", value: "pending" },
  { label: "Released", value: "released" },
  { label: "Completed", value: "completed" },
  { label: "Cancelled", value: "cancelled" },
];

export default function OrderModal({ isOpen, onClose, order, onSave }: OrderModalProps) {
  const [moNumber, setMoNumber] = useState("");
  const [moCust, setMoCust] = useState("");
  const [moDue, setMoDue] = useState<string | null>(null);
  const [moStatus, setMoStatus] = useState<Order["status"]>("pending");
  const [moRemarks, setMoRemarks] = useState("");

  useEffect(() => {
    setMoNumber(order?.order_number ?? "");
    setMoCust(order?.customer_id ?? "");
    setMoDue(order?.due_date ?? null);
    setMoStatus(order?.status ?? "pending");
    setMoRemarks(order?.remarks ?? "");
  }, [order, isOpen]);

  const handleSave = () =>
    onSave({
      id: order?.id,
      order_number: moNumber,
      customer_id: moCust,
      due_date: moDue,
      status: moStatus,
      remarks: moRemarks,
    });

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
      title={order?.id ? "Edit Order" : "New Order"}
      description="Manage manufacturing order details"
      size="md"
      footer={footer}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <InputText
          label="Order Number"
          value={moNumber}
          onChange={setMoNumber}
          placeholder="ORD-1001"
        />
        <InputText
          label="Customer ID"
          value={moCust}
          onChange={setMoCust}
          placeholder="CUST-001"
        />
        <InputText
          label="Customer ID"
          value={moDue}
          onChange={setMoDue}
          type="date"
        />

        <Dropdown
          label="Status"
          value={moStatus}
          onChange={setMoStatus}
          options={statusOptions}
          className="h-10"
        />
      </div>
      
      <div className="mt-4">
        <TextArea
          label="Remarks"
          value={moRemarks}
          onChange={setMoRemarks}
          placeholder="notes"
        />        
      </div>
    </BaseModal>
  );
}
