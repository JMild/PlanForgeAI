export type User = {
  user_id: number;
  employee_code?: string | null;
  username: string;
  password_hash?: string | null;
  email?: string | null;
  full_name?: string | null;
  user_group_id: number | null;
  image_url?: string | null;
  department?: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

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

// === setting ===

export interface Holiday {
  start_date: string;    // รูปแบบ YYYY-MM-DD
  end_date: string;      // รูปแบบ YYYY-MM-DD
  description: string;
  is_recurring: boolean;
}

export interface Shift {
  code: string;
  start: string;         // รูปแบบ HH:mm (24 ชั่วโมง)
  end: string;           // รูปแบบ HH:mm (24 ชั่วโมง)
  lines: string[];       // ชื่อสายการผลิตหรือพื้นที่
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