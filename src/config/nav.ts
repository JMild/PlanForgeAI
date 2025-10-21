import {
  LayoutDashboard,
  CalendarCheck2,
  Package,
  Settings,
  Users,
  BarChart3,
  Wrench,
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
      // 1️⃣ Dashboard
      { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard, code: "MMS001" },

      // 2️⃣ Production
      {
        label: "Production",
        icon: CalendarCheck2,
        sub: [
          { label: "Production Planning", href: "/planning", code: "TRS101" },
          { label: "Monitoring", href: "/planning/timeline", code: "TRS102" },
          // { label: "Scenario Compare", href: "/planning/scenarios", code: "TRS103" },
          { label: "Order Management", href: "/orders", code: "TRS201" },
          { label: "Production Management", href: "/production", code: "TRS401" },
        ],
      },

      // 3️⃣ Master Data
      {
        label: "Master Data",
        icon: Package,
        sub: [
          { label: "Products", href: "/masters/product", code: "MAS001" },
          // { label: "BOM", href: "/masters/bom", code: "MAS002" },
          { label: "Routing / Process Plan", href: "/masters/routing", code: "MAS003" },
          { label: "Machines", href: "/masters/machines", code: "MAS004" },
          { label: "Work Centers", href: "/masters/work-centers", code: "MAS005" },
          { label: "Shifts & Calendars", href: "/masters/shifts", code: "MAS006" },
          { label: "Personnel", href: "/masters/personnel", code: "MAS007" },
          { label: "Customers", href: "/masters/customers", code: "MAS010" },
          // { label: "Failure Codes", href: "/masters/failure-codes", code: "MAS011" },
          { label: "Materials", href: "/masters/materials", code: "MAS013" },
          // { label: "Inventory", href: "/masters/inventory", code: "MAS014" }, // optional
        ],
      },

      // 4️⃣ Tools & Maintenance
      {
        label: "Maintenance",
        icon: Wrench,
        sub: [
          { label: "Maintenance Machines", href: "/maintenance", code: "MAS012" },
        ],
      },

      // 5️⃣ Reports
      { label: "Report", href: "/report", icon: BarChart3, code: "TRS301" },

      // 6️⃣ Administration
      {
        label: "Administration",
        icon: Users,
        sub: [
          { label: "User", href: "/admin/user", code: "UMS001" },
          { label: "Group", href: "/admin/group", code: "UMS002" },
        ],
      },

      // 7️⃣ Integrations / Config
      {
        label: "Integrations",
        icon: Settings,
        href: "/integrations",
        code: "CMS002",
      },
    ]
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
