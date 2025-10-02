"use client";

import { useState } from "react";

export default function LoginForm() {
  const [id, setId] = useState("admin@example.com");
  const [pw, setPw] = useState("admin1234");
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      // TODO: call your auth API / next-auth signIn
      await new Promise((r) => setTimeout(r, 700));
      window.location.href = "/dashboard";
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      {/* Title */}
      <div className="space-y-1">
        <h1 className="text-2xl font-bold text-gray-900">Sign-In</h1>
        <p className="text-sm text-gray-500">
          Access Dashlite using your email and passcode.
        </p>
      </div>

      {/* Email or Username */}
      <div className="space-y-1.5">
        <label className="text-sm font-medium text-gray-700">
          Email or Username
        </label>
        <input
          type="text"
          className="w-full rounded-xl border border-gray-300 bg-white px-3.5 py-3 outline-none
                     focus:border-transparent focus:ring-2 focus:ring-violet-500"
          value={id}
          onChange={(e) => setId(e.target.value)}
          placeholder="you@example.com"
          autoComplete="username"
        />
      </div>

      {/* Passcode */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-gray-700">Passcode</label>
          <a href="/forgot-password" className="text-sm text-violet-600 hover:underline">
            Forgot Code?
          </a>
        </div>

        <div className="relative">
          <input
            type={show ? "text" : "password"}
            className="w-full rounded-xl border border-gray-300 bg-white px-3.5 py-3 pr-11 outline-none
                       focus:border-transparent focus:ring-2 focus:ring-violet-500"
            value={pw}
            onChange={(e) => setPw(e.target.value)}
            placeholder="••••••••"
            autoComplete="current-password"
          />
          <button
            type="button"
            onClick={() => setShow((v) => !v)}
            aria-label={show ? "Hide passcode" : "Show passcode"}
            className="absolute inset-y-0 right-0 px-3.5 text-gray-500 hover:text-gray-700"
          >
            {show ? "🙈" : "👁️"}
          </button>
        </div>
      </div>

      {/* Sign in */}
      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-xl bg-violet-600 py-3.5 text-white text-base font-semibold
                   shadow-sm hover:bg-violet-700 transition disabled:opacity-60"
      >
        {loading ? "Signing in..." : "Sign in"}
      </button>

      {/* Bottom link */}
      <p className="text-center text-sm text-gray-600">
        New on our platform?{" "}
        <a href="/register" className="text-violet-600 font-medium hover:underline">
          Create an account
        </a>
      </p>
    </form>
  );
}
