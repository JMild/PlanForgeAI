"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV } from "@/src/config/nav";
import UserMenu from "@/src/components/layout/UserMenu";
import { ChevronRight, ChevronsLeft, ChevronDown } from "lucide-react";
import { useState } from "react";
import * as Popover from "@radix-ui/react-popover";

export default function Sidebar({
  collapsed,
  onToggle,
  user,
}: {
  collapsed: boolean;
  onToggle: () => void;
  user: { full_name?: string | undefined; email?: string | undefined; image_url?: string | undefined; };
}) {
  const pathname = usePathname();
  const [openStates, setOpenStates] = useState<Record<string, boolean>>({});

  const toggleOpen = (label: string) => {
    setOpenStates((prev) => ({ ...prev, [label]: !prev[label] }));
  };

  return (
    <aside
      className={[
        "h-screen flex flex-col text-white",
        "fixed top-0 left-0 bottom-0 z-20",
        // glass base (เหมือน Header/Layout)
        "bg-white/10 dark:bg-black/20 backdrop-blur-md supports-[backdrop-filter]:bg-white/20 dark:supports-[backdrop-filter]:bg-black/20",
        "border-r border-white/20 dark:border-white/10",
        "shadow-[0_10px_30px_-15px_rgba(2,6,23,0.08)]",
        "transition-[width] duration-300 ease-in-out",
        collapsed ? "w-[80px]" : "w-[280px]",
      ].join(" ")}
    >
      {/* Logo */}
      <div className="px-5 pt-5 pb-4 flex items-center justify-between">
        <button
          type="button"
          onClick={onToggle}
          className="flex items-center gap-3 focus:outline-none"
        >
          <div className="h-9 w-9 rounded-xl grid place-items-center bg-cyan-400/10 border border-cyan-300/30 text-cyan-300">
            <svg viewBox="0 0 24 24" className="h-7 w-7">
              <path
                d="M12 3l8 4.5v9L12 21l-8-4.5v-9L12 3z"
                className="fill-current"
              />
            </svg>
          </div>
          {!collapsed && (
            <div className="leading-tight">
              <div className="text-xl font-bold tracking-tight">
                PlanForge <span className="text-cyan-300">AI</span>
              </div>
            </div>
          )}
        </button>
        <button
          type="button"
          onClick={onToggle}
          className="ml-2 hidden lg:inline-flex p-2 rounded-md hover:bg-white/10 text-white/80 hover:text-white"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? null : <ChevronsLeft className="h-5 w-5" />}
        </button>
      </div>

      {/* Nav */}
      <div className="flex-1 overflow-y-auto px-3 pb-6 scrollbar-hide">
        <ul className="space-y-6">
          {NAV.map((group, gi) => (
            <li key={gi}>
              {!collapsed && group.title && (
                <div className="px-2 pb-2 text-[11px] font-semibold tracking-wider text-white/70">
                  {group.title}
                </div>
              )}
              <ul className="space-y-1">
                {group.items.map((it) => {
                  const open = openStates[it.label];
                  const active =
                    pathname === it.href ||
                    (it.href && pathname.startsWith(it.href + "/")) ||
                    (it.sub && it.sub.some((s) => pathname.startsWith(s.href)));

                  return (
                    <li key={it.label}>
                      {/* Main menu item */}
                      {it.sub ? (
                        collapsed ? (
                          <Popover.Root
                            open={open}
                            onOpenChange={(val) =>
                              setOpenStates((prev) => ({
                                ...prev,
                                [it.label]: val,
                              }))
                            }
                          >
                            <Popover.Trigger asChild>
                              <button
                                className={[
                                  "group flex items-center justify-center w-full rounded-xl p-3 transition-colors",
                                  "focus:outline-none focus:ring-2 focus:ring-cyan-300/30",
                                  active ? "bg-white/20 text-cyan-200" : "hover:bg-white/10",
                                ].join(" ")}
                              >
                                <it.icon
                                  className={[
                                    "h-5 w-5 transition-colors",
                                    active ? "text-cyan-300" : "text-white/90 group-hover:text-white",
                                  ].join(" ")}
                                />
                              </button>
                            </Popover.Trigger>

                            <Popover.Portal>
                              <Popover.Content
                                side="right"
                                align="start"
                                sideOffset={8}
                                className={[
                                  // glass + teal accent
                                  "rounded-xl p-2 w-56 z-50",
                                  "bg-white/10 dark:bg-slate-950/40 backdrop-blur-xl",
                                  "border border-cyan-300/25",
                                  "text-white shadow-[0_20px_60px_-20px_rgba(0,200,255,0.25)]",
                                ].join(" ")}
                              >
                                {it.sub.map((sub) => {
                                  const subActive =
                                    pathname === sub.href ||
                                    pathname.startsWith(sub.href + "/");
                                  return (
                                    <Link
                                      key={sub.href}
                                      href={sub.href}
                                      className={[
                                        "block px-2 py-1.5 text-sm rounded-md transition-colors",
                                        subActive
                                          ? "bg-cyan-600/20 text-cyan-100 border border-cyan-500/30"
                                          : "text-white/90 hover:bg-cyan-500/10 hover:text-cyan-100",
                                      ].join(" ")}
                                    >
                                      {sub.label}
                                    </Link>
                                  );
                                })}

                                {/* Arrow ให้สีกลืนกับพื้นหลัง */}
                                <Popover.Arrow className="fill-white/10 dark:fill-slate-950/40" />
                              </Popover.Content>
                            </Popover.Portal>
                          </Popover.Root>

                        ) : (
                          <div
                            onClick={() => toggleOpen(it.label)}
                            className={[
                              "group flex items-center rounded-xl px-3 py-2.5 transition-colors cursor-pointer gap-3",
                              active
                                ? "bg-white/20 text-cyan-200"
                                : "hover:bg-white/10",
                            ].join(" ")}
                          >
                            <it.icon
                              className={[
                                "h-5 w-5",
                                active ? "text-cyan-300" : "text-white/90",
                              ].join(" ")}
                            />
                            <span className="flex-1">{it.label}</span>
                            {open ? (
                              <ChevronDown className="h-4 w-4 text-white/80" />
                            ) : (
                              <ChevronRight className="h-4 w-4 text-white/80" />
                            )}
                          </div>
                        )
                      ) : (
                        <Link
                          href={it.href ?? "#"}
                          className={[
                            "group flex items-center rounded-xl px-3 py-2.5 transition-colors",
                            active
                              ? "bg-white/20 text-cyan-200"
                              : "hover:bg-white/10",
                            collapsed ? "justify-center" : "gap-3",
                          ].join(" ")}
                        >
                          <it.icon
                            className={[
                              "h-5 w-5",
                              active ? "text-cyan-300" : "text-white/90",
                            ].join(" ")}
                          />
                          {!collapsed && <span className="flex-1">{it.label}</span>}
                        </Link>
                      )}

                      {/* Sub-menu inline */}
                      {it.sub && open && !collapsed && (
                        <ul className="ml-8 mt-1 space-y-1">
                          {it.sub.map((sub) => {
                            const subActive = pathname === sub.href;
                            return (
                              <li key={sub.href}>
                                <Link
                                  href={sub.href}
                                  className={[
                                    "flex items-center text-sm px-2 py-1.5 rounded-md transition-colors",
                                    subActive
                                      ? "bg-cyan-600/20 text-cyan-100 dark:bg-cyan-500/20 dark:text-white"
                                      : "text-white/90 hover:bg-white/10",
                                  ].join(" ")}
                                >
                                  <span className="mr-3 h-1.5 w-1.5 rounded-full bg-current" />
                                  {sub.label}
                                </Link>
                              </li>
                            );
                          })}
                        </ul>
                      )}
                    </li>
                  );
                })}
              </ul>
            </li>
          ))}
        </ul>
      </div>

      {/* UserMenu */}
      <div className="p-4 border-t border-white/20">
        <UserMenu user={user} compact={collapsed} />
      </div>
    </aside>
  );
}
