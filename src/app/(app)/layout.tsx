"use client";

import { useState, useEffect, useMemo } from "react";
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

  // ความกว้าง Sidebar (จองพื้นที่ไว้ให้แน่นอน)
  const sidebarWidth = useMemo(() => (collapsed ? 80 : 280), [collapsed]);

  return (
    <ThemeProvider>
      <div className="relative min-h-screen flex overflow-hidden text-white">
        {/* ========== KEYFRAMES ========== */}
        <style>{`
          @keyframes floatSlow { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-18px)} }
          @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-12px)} }
        `}</style>

        {/* ====== BACKGROUND: Teal/Azure HUD ====== */}
        {/* radial glows */}
        <div className="absolute inset-0 bg-[radial-gradient(1200px_600px_at_75%_35%,rgba(0,229,255,.18),transparent_60%),radial-gradient(900px_500px_at_15%_65%,rgba(20,184,166,.18),transparent_60%)]" />
        {/* deep ocean gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#03151c] via-[#0b2733] to-[#010b11]" />
        {/* HUD grid */}
        <div
          className="absolute inset-0 opacity-[0.12] mix-blend-screen"
          style={{
            backgroundImage:
              "linear-gradient(rgba(0,243,255,.22) 1px, transparent 1px), linear-gradient(90deg, rgba(0,243,255,.22) 1px, transparent 1px)",
            backgroundSize: "46px 46px",
          }}
        />
        {/* orbs */}
        <div
          className="pointer-events-none absolute -top-24 -left-16 h-80 w-80 rounded-full bg-cyan-400/30 blur-3xl"
          style={{ animation: "floatSlow 12s ease-in-out infinite" }}
        />
        <div
          className="pointer-events-none absolute bottom-10 -right-10 h-96 w-96 rounded-full bg-teal-400/25 blur-3xl"
          style={{ animation: "floatSlow 14s ease-in-out -2s infinite" }}
        />
        <div
          className="pointer-events-none absolute top-1/3 left-1/2 -translate-x-1/2 h-72 w-72 rounded-full bg-sky-400/25 blur-3xl"
          style={{ animation: "float 10s ease-in-out -1s infinite" }}
        />
        {/* lens flare (optional) */}
        <div className="pointer-events-none absolute top-10 right-16 w-40 h-40 rounded-full bg-cyan-300/20 blur-2xl" />
        <div className="pointer-events-none absolute top-16 right-24 w-16 h-16 rounded-full bg-cyan-200/80 blur-md" />

        {/* ====== CONTENT ====== */}
        <div className="relative z-10 flex h-full w-full">
          {/* 👉 จองพื้นที่ Sidebar แบบ fixed width ไม่ให้ทับ children */}
          <div className="shrink-0 h-screen overflow-hidden" style={{ width: sidebarWidth }}>
            <Sidebar
              user={{
                full_name: user.full_name ?? undefined,
                email: user.email ?? undefined,
                image_url: user.profile_image_url ?? undefined,
              }}
              collapsed={collapsed}
              onToggle={() => setCollapsed((prev) => !prev)}
            />

          </div>

          {/* 👉 พื้นที่เนื้อหา */}
          <section className="flex-1 min-w-0 h-screen overflow-y-auto flex flex-col">
            {/* Header slot (PageHeader จะ portal มาก็ได้ หรือใส่ตรงนี้ได้เลย) */}
            <div id="app-header-slot" />
            <div className="flex-1">{children}</div>

            <footer className="text-center text-sm text-cyan-100/70 py-4">
              © 2025 PlanForge System · by ARiSE | v1.0.0
            </footer>
          </section>
        </div>
      </div>
    </ThemeProvider>
  );
}
