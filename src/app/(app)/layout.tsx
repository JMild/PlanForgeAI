"use client";

import { useState, useEffect } from "react";
import { User } from "@/src/types";
import { ThemeProvider } from "@/src/context/ThemeContext";
import Sidebar from "@/src/components/layout/Sidebar";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);

  const user: Partial<User> = {
    full_name: "Somchai Boonmee",
    email: "somchai@example.com",
  };

  useEffect(() => {
    const handleResize = () => setCollapsed(window.innerWidth < 1024);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <ThemeProvider>
      <div className="h-svh flex bg-slate-50 dark:bg-slate-900 overflow-hidden text-slate-900 dark:text-slate-50">
        <Sidebar
          user={user}
          collapsed={collapsed}
          onToggle={() => setCollapsed((prev) => !prev)}
        />

        <section
          className={[
            "flex-1 min-w-0 overflow-y-auto flex flex-col", 
            "bg-slate-50 text-slate-800 dark:bg-slate-900 dark:text-slate-100",
          ].join(" ")}
        >
          <div id="app-header-slot" />

          <div className="flex-1">
            {children}
          </div>

          <footer className="text-center text-sm text-slate-500 dark:text-slate-400 py-4">
            © 2025 PlanForge System · by ARiSE | v1.0.0
          </footer>
        </section>
      </div>
    </ThemeProvider>
  );
}
