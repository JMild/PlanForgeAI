// @ts-nocheck
"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import BaseModal from "@/src/components/shared/modal/BaseModal";
import InputText from "@/src/components/shared/input/InputText";
import Dropdown from "@/src/components/shared/input/Dropdown";
import ImageUploader from "@/src/components/shared/input/ImageUploader";
import ToggleSwitch from "@/src/components/shared/input/ToggleSwitch";

type Product = {
  id?: number;
  product_number?: string;
  name?: string;
  category?: string;
  std_rate_min?: number;
  unit_code?: string;
  description?: string;
  image_url?: string;
  location_code?: string;
  type?: "FG" | "RM" | "WIP";
  lot_size?: number;
  safety_stock?: number;
  is_active?: boolean;
};

type ProductModalProps = {
  isOpen: boolean;
  onClose: () => void;
  product?: Product | null;
  onSave: (product: Product) => void;
};

export default function ProductModal({
  isOpen,
  onClose,
  product,
  onSave,
}: ProductModalProps) {
  const [mpCode, setMpCode] = useState("");
  const [mpName, setMpName] = useState("");
  const [mpCat, setMpCat] = useState("");
  const [mpUnit, setMpUnit] = useState("");
  const [type, setType] = useState<"FG" | "RM" | "WIP">("FG");
  const [lot, setLot] = useState<number | "">("");
  const [stdRate, setStdRate] = useState<number | "">("");
  const [safetyStock, setSafetyStock] = useState<number | "">("");
  const [mpImg, setMpImg] = useState("");
  const [mpDesc, setMpDesc] = useState("");
  const [location, setLocation] = useState("");
  const [active, setActive] = useState(true);

  const initialFocusRef = useRef<HTMLInputElement>(null);

  const isEdit = useMemo(() => !!product?.id, [product]);

  const typeOptions = [
    { label: "FG – Finished Goods", value: "FG" },
    { label: "RM – Raw Material", value: "RM" },
    { label: "WIP – Work In Progress", value: "WIP" },
  ];

  const locationOptions = [
    { label: "Location A", value: "LA" },
    { label: "Location B", value: "LB" },
    { label: "Location C", value: "LC" },
  ];

  useEffect(() => {
    if (isOpen) {
      setMpCode(product?.product_number ?? "");
      setMpName(product?.name ?? "");
      setMpCat(product?.category ?? "");
      setMpUnit(product?.unit_code ?? "");
      setType(product?.type ?? "FG");
      setLot(product?.lot_size ?? "");
      setStdRate(product?.std_rate_min ?? "");
      setSafetyStock(product?.safety_stock ?? "");
      setMpImg(product?.image_url ?? "");
      setMpDesc(product?.description ?? "");
      setLocation(product?.location_code ?? "");
      setActive(product?.is_active ?? true);
    }
  }, [isOpen, product]);

  const canSave = mpCode.trim() !== "" && mpName.trim() !== "";

  const handleSave = useCallback(() => {
    if (!canSave) {
      alert("กรุณากรอก Product Code และ Product Name");
      return;
    }

    onSave({
      id: product?.id,
      product_number: mpCode.trim(),
      name: mpName.trim(),
      category: mpCat.trim() || undefined,
      unit_code: mpUnit.trim() || undefined,
      type,
      lot_size: typeof lot === "number" ? lot : undefined,
      std_rate_min: typeof stdRate === "number" ? stdRate : undefined,
      safety_stock: typeof safetyStock === "number" ? safetyStock : undefined,
      image_url: mpImg || undefined,
      description: mpDesc.trim() || undefined,
      location_code: location || undefined,
      is_active: active,
    });
  }, [
    product,
    mpCode,
    mpName,
    mpCat,
    mpUnit,
    type,
    lot,
    stdRate,
    safetyStock,
    mpImg,
    mpDesc,
    location,
    active,
    canSave,
    onSave,
  ]);

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      onSave={handleSave}
      title={isEdit ? "Edit Product" : "New Product"}
      description="Define product master for production"
      footer={true}
      size="lg"
      initialFocusRef={initialFocusRef}
    >
      {/* Image Upload */}
      <div className="flex justify-center mb-4">
        <ImageUploader value={mpImg} onChange={setMpImg} />
      </div>

      {/* Grid Form */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <InputText
          label="Product Code"
          value={mpCode}
          onChange={setMpCode}
          placeholder="ELEC-001"
          inputRef={initialFocusRef}
          required
        />
        <InputText
          label="Product Name"
          value={mpName}
          onChange={setMpName}
          placeholder="Product A"
          required
        />
        <Dropdown
          label="Type"
          value={type}
          onChange={setType}
          options={typeOptions}
          required
        />
        <Dropdown
          label="Location"
          value={location}
          onChange={setLocation}
          options={locationOptions}
          required
        />
        <InputText
          label="Category"
          value={mpCat}
          onChange={setMpCat}
          placeholder="Electronics"
        />
        <InputText
          label="Unit"
          value={mpUnit}
          onChange={setMpUnit}
          placeholder="pcs"
        />
        <InputText
          label="Lot Size"
          type="number"
          value={lot === "" ? "" : String(lot)}
          onChange={(val) => setLot(val === "" ? "" : Number(val))}
          placeholder="30"
        />
        <InputText
          label="Std Rate (min)"
          type="number"
          value={stdRate === "" ? "" : String(stdRate)}
          onChange={(val) => setStdRate(val === "" ? "" : Number(val))}
          placeholder="30"
        />
        <InputText
          label="Safety Stock Level"
          type="number"
          value={safetyStock === "" ? "" : String(safetyStock)}
          onChange={(val) => setSafetyStock(val === "" ? "" : Number(val))}
          placeholder="30"
        />
      </div>

      {/* Description */}
      <div className="mt-4">
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
          Description
        </label>
        <textarea
          rows={3}
          className="resize-none block w-full rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm"
          value={mpDesc}
          onChange={(e) => setMpDesc(e.target.value)}
          placeholder="Description..."
        />
      </div>

      {/* Active Switch */}
      <div className="mt-4">
        <ToggleSwitch label="Active" checked={active} onChange={setActive} />
      </div>
    </BaseModal>
  );
}
