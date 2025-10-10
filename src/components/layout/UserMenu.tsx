"use client"

import { createPortal } from "react-dom";
import { useState, useRef, useLayoutEffect, useEffect, useCallback, useMemo } from "react";
import NextLink from "next/link";
import Image from "next/image";
import { Settings, HelpCircle, LogOut, 
  // Moon, Sun, 
  ChevronDown } from "lucide-react";
// import { useThemeContext } from "@/src/context/ThemeContext";
import { useRouter } from "next/navigation";
import GlassCard from "../shared/card/GlassCard";

type User = { full_name?: string | undefined; email?: string | undefined; image_url?: string | undefined; };
type Props = { user: User; compact?: boolean };

export default function UserMenu({ user, compact = false }: Props) {
  const router = useRouter();
  // const { theme, setTheme } = useThemeContext();

  const [open, setOpen] = useState(false);
  const btnRef = useRef<HTMLButtonElement | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const [coords, setCoords] = useState<{ left: number; top: number } | null>(null);
  const MENU_WIDTH = 256;

  const initials = useMemo(() => {
    const name = (user.full_name || "").trim();
    return (
      name
        .split(/\s+/)
        .slice(0, 2)
        .map((p) => p[0]?.toUpperCase() ?? "")
        .join("") || "U"
    );
  }, [user.full_name]);

  const avatarSrc = user.image_url || "";

  // close on outside/Esc
  useEffect(() => {
    function onDocMouseDown(e: MouseEvent) {
      if (!open) return;
      const t = e.target as Node;
      if (menuRef.current?.contains(t) || btnRef.current?.contains(t)) return;
      setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (!open) return;
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onDocMouseDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDocMouseDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const computePosition = useCallback(() => {
    if (!btnRef.current || !menuRef.current) return;
    const br = btnRef.current.getBoundingClientRect();
    const mh = menuRef.current.offsetHeight || 0;
    const gap = 8;
    const left = Math.round(br.right - MENU_WIDTH);
    // NOTE: ต้องการให้ลอย "เหนือปุ่ม" เหมือนเดิม
    const top = Math.round(br.top - mh - gap);
    // ถ้าอยากให้ Dropdown ลงข้างล่างแทน ให้ใช้: const top = Math.round(br.bottom + gap);
    setCoords({ left: Math.max(8, left), top: Math.max(8, top) });
  }, []);

  useLayoutEffect(() => {
    if (!open) return;
    computePosition();
    const raf = requestAnimationFrame(computePosition);
    const onWin = () => computePosition();
    window.addEventListener("resize", onWin);
    window.addEventListener("scroll", onWin, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onWin);
      window.removeEventListener("scroll", onWin);
    };
  }, [open, computePosition]);

  const handleLogout = () => {
    localStorage.clear();
    sessionStorage.clear();
    setOpen(false);
    router.push("/auth/login");
  };

  return (
    <div className="relative">
      <button
        ref={btnRef}
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="group inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-2 py-1 pr-2
                   backdrop-blur text-white shadow-sm hover:bg-white/15 focus:outline-none focus:ring-2 focus:ring-cyan-300/30 transition"
      >
        {/* Avatar */}
        <div className="h-8 w-8 rounded-full grid place-items-center overflow-hidden
                        bg-cyan-400/10 border border-cyan-300/30 text-cyan-300">
          {avatarSrc ? (
            <Image src={avatarSrc} alt="" width={32} height={32} className="object-cover" />
          ) : (
            <span className="text-xs">{initials}</span>
          )}
        </div>

        {!compact && <span className="truncate text-sm font-medium text-white/90">{user.full_name}</span>}
        {!compact && (
          <ChevronDown
            size={16}
            className={`transition-transform duration-200 text-white/80 ${open ? "rotate-180" : "rotate-0"}`}
          />
        )}
      </button>

      {/* Portal Menu */}
      {open &&
        typeof window !== "undefined" &&
        createPortal(
          <div
            ref={menuRef}
            style={{
              position: "fixed",
              left: coords?.left ?? -9999,
              top: coords?.top ?? -9999,
              visibility: coords ? "visible" : "hidden",
              width: MENU_WIDTH,
              zIndex: 9999,
            }}
          >
            <GlassCard
              className="p-3 border border-cyan-300/25 bg-white/10 backdrop-blur-md text-white"
            >
              {/* Header */}
              <div className="flex items-center gap-3 mb-2">
                {avatarSrc ? (
                  <div className="h-9 w-9 relative rounded-full overflow-hidden ring-1 ring-cyan-300/30">
                    <Image src={avatarSrc} alt="" fill className="object-cover" />
                  </div>
                ) : (
                  <span className="h-9 w-9 grid place-items-center rounded-full
                                   bg-cyan-400/10 text-cyan-200 font-semibold border border-cyan-300/30">
                    {initials}
                  </span>
                )}
                <div className="min-w-0">
                  <p className="truncate font-medium text-white/95">{user.full_name}</p>
                  {user.email && <p className="truncate text-xs text-cyan-100/70">{user.email}</p>}
                </div>
              </div>

              <div className="border-t border-white/20 my-3" />

              {/* Theme buttons */}
              {/* <button
                onClick={() => {
                  setTheme("light");
                  setOpen(false);
                }}
                className={`flex items-center gap-2 px-2 py-1 rounded transition
                           ${theme === "light" ? " text-cyan-300" : "hover:bg-cyan-500/10 text-white/90"}`}
              >
                <Sun className="h-4 w-4" />
                Light
              </button>
              <button
                onClick={() => {
                  setTheme("dark");
                  setOpen(false);
                }}
                className={`flex items-center gap-2 px-2 py-1 rounded transition
                           ${theme === "dark" ? " text-cyan-300" : "hover:bg-cyan-500/10 text-white/90"}`}
              >
                <Moon className="h-4 w-4" />
                Dark
              </button>

              <div className="border-t border-white/20 my-2" /> */}

              {/* Links */}
              <NextLink
                href="/settings"
                className="flex items-center gap-2 px-2 py-1 rounded hover:bg-cyan-500/10 text-white/90"
                onClick={() => setOpen(false)}
              >
                <Settings className="h-4 w-4" /> Settings
              </NextLink>
              <NextLink
                href="/help"
                className="flex items-center gap-2 px-2 py-1 rounded hover:bg-cyan-500/10 text-white/90"
                onClick={() => setOpen(false)}
              >
                <HelpCircle className="h-4 w-4" /> Help
              </NextLink>

              <div className="border-t border-white/20 my-2" />

              <button
                onClick={handleLogout}
                className="flex w-full items-center gap-2 px-2 py-1 text-rose-300 hover:text-rose-200 hover:bg-rose-500/10 rounded"
              >
                <LogOut className="h-4 w-4" /> Log out
              </button>
            </GlassCard>
          </div>,
          document.body
        )}
    </div>
  );
}
