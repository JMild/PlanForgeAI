import {
  LayoutDashboard,
  CalendarCheck2,
  Settings2,
  UserRound,
  AppWindow,
  Presentation,
} from "lucide-react";

export type Sub = { label: string; href: string; code?: string };
export type Item = {
  label: string;
  href?: string;
  code?: string;
  icon: React.ComponentType<{ className?: string }>;
  sub?: Sub[];
};
export type Group = { title?: string; items: Item[] };

export const NAV: Group[] = [
  {
    items: [
      { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard, code: 'MMS001' },
      {
        label: "Production Planning",
        icon: CalendarCheck2,
        sub: [
          { label: "Planner Board", href: "/planning", code: 'TRS101' },
          { label: "Mornitering", href: "/planning/timeline", code: 'TRS102' },
          // { label: "Scenario Compare", href: "/planning/scenarios", code: 'TRS103' },
        ],
      },
      { label: "Order Management", icon: CalendarCheck2, href: "/orders", code: 'TRS201' },
      { label: "Production Management", icon: CalendarCheck2, href: "/production", code: 'TRS401' },
      { label: "Report", icon: Presentation, href: "/report", code: 'TRS301'  },
      {
        label: "Master Data",
        icon: AppWindow,
        sub: [
          // edit 
          { label: "Products", href: "/masters/product", code: 'MAS001' },
          { label: "BOM", href: "/masters/bom", code: 'MAS002' },
          { label: "Routing / Process Plan", href: "/masters/routing", code: 'MAS003' },
          { label: "Machines", href: "/masters/machines", code: 'MAS004' },
          { label: "Work Centers", href: "/masters/work-centers", code: 'MAS005' },
          { label: "Shifts & Calendars", href: "/masters/shifts", code: 'MAS006' },
          { label: 'Personnel', href: '/masters/personnel', code: 'MAS007' },
          { label: 'Skills Matrix', href: '/masters/skills', code: 'MAS008' },
          { label: 'Tools & Molds', href: '/masters/tools', code: 'MAS009' },
          { label: 'Customers', href: '/masters/customers', code: 'MAS010' },
          { label: 'Failure Codes', href: '/masters/failure-codes', code: 'MAS011' },
          { label: 'Maintenance Plans', href: '/masters/maintenance', code: 'MAS012' },
          { label: 'Materials', href: '/masters/materials', code: 'MAS013' },
          { label: 'Inventory / On‑hand', href: '/masters/inventory', code: 'MAS014' }, // (optional if ERP)
        ],
      },
      {
        label: "User Management", href: "/admin", icon: UserRound,
        sub: [
          { label: "User", href: "/admin/user", code: 'UMS001' },
          { label: "Group", href: "/admin/group", code: 'UMS002' }
        ],
      },
      {
        label: "Configuration", icon: Settings2,
        sub: [
          { label: "Settings", href: "/config/settings", code: 'CMS001' },
          { label: "Integrations", href: "/config/integrations", code: 'CMS002' },
          { label: "Audit Log", href: "/config/audit", code: 'CMS003' }
        ],
      },
      // {
      //   label: "Help", icon: UserRound,
      //   sub: [
      //     { label: "Help & Docs", href: "/help" },
      //   ],
      // },
    ],
  },
];

export function getTitleFromPath(pathname: string): string {
  for (const g of NAV) {
    for (const it of g.items) {
      if (it.sub?.length) {
        const exact = it.sub.find((s) => s.href === pathname);
        if (exact) return exact.label;
        if (pathname === it.href || pathname.startsWith(it.href + "/")) return it.label;
      } else {
        if (pathname === it.href || pathname.startsWith(it.href + "/")) return it.label;
      }
    }
  }
  const seg = pathname.split("/").filter(Boolean).pop() || "App";
  return seg.charAt(0).toUpperCase() + seg.slice(1);
}
