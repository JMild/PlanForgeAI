"use client";

import { createPortal } from "react-dom";
import { useEffect, useState } from "react";

export default function HeaderPortal({ children }: { children: React.ReactNode }) {
  const [el, setEl] = useState<Element | null>(null);

  useEffect(() => {
    setEl(document.getElementById("app-header-slot"));
  }, []);

  if (!el) return null;
  return createPortal(children, el);
}