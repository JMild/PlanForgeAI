export type User = {
  user_id: number;
  employee_code?: string | null;
  username: string;
  password_hash?: string | null;
  email?: string | null;
  full_name?: string | null;
  user_group_id: number | null;
  profile_image_url?: string | null;
  department?: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export enum JobStatusEnum {
  All = "all",
  InProgress = "In Progress",
  Ready = "Ready",
  Completed = "Completed",
  Paused = "Paused",
  Late = "Late",
  Pending = "Pending",
  Scheduled = "Scheduled",
}

export type ModalMode = 'edit' | 'view' | 'create' | null;

export type Group = {
  group_id: number;
  group_name: string;
  description?: string | null;
  is_active: boolean;
};

export type Screen = {
  code: string;
  name: string;
};

export type Permission = {
  permission_id: number;
  group_id: number;
  screen_code: string;
  can_view: boolean;
  can_add: boolean;
  can_edit: boolean;
  can_delete: boolean;
};

export type Payload = {
  users: User[];
  groups: Group[];
  screens: Screen[];
  permissions: Permission[];
};

// types.ts
export type Machine = {
  code: string;
  name: string;
  workCenter: string;
  status: 'Running' | 'Idle' | 'PM' | 'Down' | string;
};

export type Job = {
  jobId: string;
  orderNo: string;
  product: string;
  process: string;
  machineCode: string;
  startTime: string;
  endTime: string;
  setupMin: number;
  runMin: number;
  status: 'Planned' | 'In Progress' | 'Completed' | 'Late' | string;
};

export type Maintenance = {
  id: string;
  machineCode: string;
  type: string;
  startTime: string;
  endTime: string;
  notes: string;
};

export type Shift = {
  name: string;
  start: string;
  end: string;
  color: string;
};

export type BreakTime = {
  start: string;
  end: string;
  name: string;
};

export type SelectedJob = (Job | Maintenance) & { type: 'job' | 'maintenance' };

// === setting ===

export interface Holiday {
  start_date: string;    // รูปแบบ YYYY-MM-DD
  end_date: string;      // รูปแบบ YYYY-MM-DD
  description: string;
  is_recurring: boolean;
}

export interface BreakRow {
  shift_code: string;    // รหัสกะงาน เช่น "A", "B"
  start: string;         // เวลาเริ่มพัก HH:mm
  end: string;           // เวลาสิ้นสุดพัก HH:mm
}

export interface OTRules {
  daily_cap_hours: number;       // จำนวนชั่วโมง OT สูงสุดต่อวัน
  allow_weekend_ot: boolean;     // อนุญาต OT วันหยุดสุดสัปดาห์หรือไม่
  default_setup_min: number;     // เวลาตั้งเครื่อง default (นาที)
  default_buffer_min: number;    // เวลาบัฟเฟอร์ default (นาที)
}

export interface SetupRule {
  from: string;          // ตัวอย่าง: รหัสเครื่องจักรหรือขั้นตอน P1
  to: string;            // ตัวอย่าง: รหัสเครื่องจักรหรือขั้นตอน P2
  setup_min: number;     // เวลาตั้งเครื่อง (นาที)
}

export interface Constraints {
  enforce_maintenance: boolean;         // บังคับใช้การบำรุงรักษาหรือไม่
  enforce_material_ready: boolean;      // บังคับให้วัสดุพร้อมก่อนผลิตหรือไม่
  material_ready_offset_min: number;    // offset เวลาวัสดุพร้อม (นาที)
  freeze_window_min: number;             // เวลาห้ามแก้ไขก่อนเริ่มงาน (นาที)
}

export interface MaintWin {
  machine_id: string;        // รหัสเครื่องจักร
  start_dt: string;          // วันที่และเวลาเริ่ม (ISO string เช่น 2025-08-20T13:00)
  end_dt: string;            // วันที่และเวลาสิ้นสุด (ISO string)
  type: string;              // ประเภทการบำรุงรักษา เช่น "PM" หรือ "Unplanned"
  note?: string;             // หมายเหตุ (ถ้ามี)
}