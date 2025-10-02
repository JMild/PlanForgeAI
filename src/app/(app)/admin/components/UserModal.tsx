"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import BaseModal from "@/src/components/shared/modal/BaseModal";
import InputText from "@/src/components/shared/input/InputText";
import ImageUploader from "@/src/components/shared/input/ImageUploader";
import { Group, User } from "@/src/types";

type Props = {
  open: boolean;
  onClose: () => void;
  onSave: (user: Partial<User> & { user_id?: number; password?: string }) => void;
  groups: Group[];
  editing?: User | null;
};

export default function UserModal({
  open,
  onClose,
  onSave,
  groups,
  editing,
}: Props) {
  const [frm, setFrm] = useState<Partial<User>>({});
  const [password, setPassword] = useState("");
  const title = editing ? "Edit User" : "New User";
  const initialFocusRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editing) {
      setFrm(editing);
      setPassword("");
    } else {
      setFrm({
        is_active: true,
        user_group_id: groups[0]?.group_id ?? null,
      });
      setPassword("");
    }
  }, [open, editing, groups]);

  const avatar = useMemo(() => {
    return frm.profile_image_url || `https://i.pravatar.cc/100?u=${frm.username ?? "u"}`;
  }, [frm.profile_image_url, frm.username]);

  const set = (k: keyof User, v: any) => setFrm((p) => ({ ...p, [k]: v }));

  const canSave = frm.username?.trim();

  const handleSave = () => {
    if (!canSave) {
      alert("Username ห้ามว่าง");
      return;
    }
    onSave({ ...frm, password: password || undefined });
  };

  return (
    <BaseModal
      isOpen={open}
      onClose={onClose}
      onSave={handleSave}
      title={title}
      description="จัดการข้อมูลผู้ใช้งานระบบ"
      size="lg"
      footer={true}
      initialFocusRef={initialFocusRef}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Avatar Upload */}
        <div className="col-span-full flex items-center justify-center mb-2">
          <ImageUploader
            value={frm.profile_image_url ?? ""}
            onChange={(val) => set("profile_image_url", val)}
          />
        </div>

        <InputText
          label="Employee Code"
          placeholder="EMP001"
          value={frm.employee_code ?? ""}
          onChange={(v) => set("employee_code", v)}
        />

        <InputText
          label="Username *"
          placeholder="username"
          value={frm.username ?? ""}
          onChange={(v) => set("username", v)}
          inputRef={initialFocusRef}
          required
        />

        <InputText
          label="Full Name"
          placeholder="Full Name"
          value={frm.full_name ?? ""}
          onChange={(v) => set("full_name", v)}
        />

        <InputText
          label="Email"
          placeholder="email@example.com"
          value={frm.email ?? ""}
          onChange={(v) => set("email", v)}
        />

        <InputText
          label="Department"
          placeholder="Planning / Production / QA ..."
          value={frm.department ?? ""}
          onChange={(v) => set("department", v)}
        />

        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1">
            Group
          </label>
          <select
            className="w-full rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm"
            value={frm.user_group_id ?? ""}
            onChange={(e) => set("user_group_id", Number(e.target.value))}
          >
            {groups.map((g) => (
              <option key={g.group_id} value={g.group_id}>
                {g.group_name}
              </option>
            ))}
          </select>
        </div>

        <InputText
          label="New Password"
          type="password"
          placeholder="(optional for update)"
          value={password}
          onChange={setPassword}
        />
      </div>

      {/* Toggle Active */}
      <div className="mt-6 flex items-center justify-between">
        <label className="flex items-center gap-3 text-sm font-medium text-slate-700 dark:text-slate-200 select-none">
          <span>Active</span>
          <button
            type="button"
            role="switch"
            aria-checked={!!frm.is_active}
            onClick={() => set("is_active", !frm.is_active)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              frm.is_active ? "bg-sky-600" : "bg-gray-300"
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                frm.is_active ? "translate-x-6" : "translate-x-1"
              }`}
            />
          </button>
        </label>
      </div>
    </BaseModal>
  );
}
