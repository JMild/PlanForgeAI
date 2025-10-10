"use client";
import React, { useEffect, useState } from "react";
import { Mail, Lock, Eye, EyeOff, LogIn, AlertCircle, Cpu, BarChart3, Users } from "lucide-react";
import { useRouter } from "next/navigation";
import GlassCard from "@/src/components/shared/card/GlassCard";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("demo@example.com");
  const [password, setPassword] = useState("demo123");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = () => {
    setError("");
    setIsLoading(true);
    setTimeout(() => {
      if (email === "demo@example.com" && password === "demo123") router.push("/dashboard");
      else setError("Invalid email or password. Try demo@example.com / demo123");
      setIsLoading(false);
    }, 900);
  };

  useEffect(() => {
    const html = document.documentElement, body = document.body;
    const prevHtml = html.style.overflow, prevBody = body.style.overflow;
    html.style.overflow = "hidden"; body.style.overflow = "hidden";
    return () => { html.style.overflow = prevHtml; body.style.overflow = prevBody; };
  }, []);

  return (
    <div className="relative min-h-screen flex text-white">
      {/* ========== KEYFRAMES ========== */}
      <style>{`
        @keyframes floatSlow { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-18px)} }
        @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-12px)} }
        @keyframes fadeUp { from{opacity:0; transform:translateY(16px)} to{opacity:1; transform:translateY(0)} }
        @keyframes staggerIn { from{opacity:0; transform:translateY(10px)} to{opacity:1; transform:translateY(0)} }
        @keyframes glowPulse { 0%,100%{box-shadow:0 0 0 0 rgba(56, 189, 248, .25)} 50%{box-shadow:0 0 0 8px rgba(56, 189, 248, .08)} }
        @keyframes shimmer { 0%{background-position:-200% 0} 100%{background-position:200% 0} }
      `}</style>

      {/* ====== BACKGROUND (Teal/Azure HUD) ====== */}
      <div className="absolute inset-0 bg-[radial-gradient(1200px_600px_at_75%_35%,rgba(0,229,255,.18),transparent_60%),radial-gradient(900px_500px_at_15%_65%,rgba(20,184,166,.18),transparent_60%)]" />
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
      {/* Orbs */}
      <div className="pointer-events-none absolute -top-24 -left-16 h-80 w-80 rounded-full bg-cyan-400/30 blur-3xl" style={{ animation: "floatSlow 12s ease-in-out infinite" }} />
      <div className="pointer-events-none absolute bottom-10 -right-10 h-96 w-96 rounded-full bg-teal-400/25 blur-3xl" style={{ animation: "floatSlow 14s ease-in-out -2s infinite" }} />
      <div className="pointer-events-none absolute top-1/3 left-1/2 -translate-x-1/2 h-72 w-72 rounded-full bg-sky-400/25 blur-3xl" style={{ animation: "float 10s ease-in-out -1s infinite" }} />

      {/* ====== LEFT: BRAND / FEATURES ====== */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12 relative z-10">
        <div>
          <div className="flex items-center gap-3 mb-8" style={{ animation: "fadeUp .6s ease-out both" }}>
            <div className="h-12 w-12 rounded-xl grid place-items-center bg-cyan-400/10 border border-cyan-300/30 text-cyan-300">
              <svg viewBox="0 0 24 24" className="h-8 w-8">
                <path
                  d="M12 3l8 4.5v9L12 21l-8-4.5v-9L12 3z"
                  className="fill-current"
                />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl font-bold">PlanForge <span className="text-cyan-300">AI</span></h1>
              <p className="text-sm text-cyan-200/80">Efficient Production Planning</p>
            </div>
          </div>

          <div className="space-y-8 mt-16">
            <h2 className="text-5xl font-extrabold leading-tight tracking-tight" style={{ animation: "fadeUp .7s ease-out .05s both" }}>
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-white via-white to-cyan-200/80">AI-Powered</span><br />
              <span className="text-white">Simulator</span>
            </h2>

            <p className="text-lg text-cyan-100/90 max-w-md" style={{ animation: "fadeUp .7s ease-out .1s both" }}>
              Optimize schedules with real-time insights and intelligent routing constraints.
            </p>

            <div className="space-y-4 mt-10">
              {[
                { icon: Cpu, title: "AI Scheduling", desc: "Heuristics + GA for on-time & utilization" },
                { icon: BarChart3, title: "Live Analytics", desc: "KPIs & bottlenecks at a glance" },
                { icon: Users, title: "Skill Matching", desc: "Assign jobs to qualified operators" },
              ].map((f, i) => {
                const Icon = f.icon;
                return (
                  <div key={i} className="flex items-start gap-4" style={{ animation: `staggerIn .5s ease-out ${0.12 + i * 0.08}s both` }}>
                    <div className="w-10 h-10 rounded-lg bg-cyan-400/10 border border-cyan-300/30 backdrop-blur grid place-items-center shrink-0">
                      <Icon className="w-5 h-5 text-cyan-300" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">{f.title}</h3>
                      <p className="text-sm text-cyan-100/90">{f.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* ====== RIGHT: GLASS CARD ====== */}
      <div className="flex-1 flex items-center justify-center p-6 relative z-10">
        <div className="w-full max-w-md">
          {/* mobile logo */}
          <div className="lg:hidden flex items-center justify-center gap-3 mb-8" style={{ animation: "fadeUp .5s ease-out both" }}>
            <div className="h-9 w-9 rounded-xl grid place-items-center bg-cyan-400/10 border border-cyan-300/30 text-cyan-300">
              <svg viewBox="0 0 24 24" className="h-7 w-7">
                <path
                  d="M12 3l8 4.5v9L12 21l-8-4.5v-9L12 3z"
                  className="fill-current"
                />
              </svg>
            </div>
            <h1 className="text-xl font-bold">PlanForge <span className="text-cyan-300">AI</span></h1>
          </div>

          <GlassCard title="Welcome Back" subtitle="Sign in to your account to continue">
            {/* error */}
            {error && (
              <div className="mb-4 p-3 rounded-lg border border-rose-300/30 bg-rose-400/10 text-rose-200 text-sm flex items-center gap-2" style={{ animation: "fadeUp .4s ease-out both" }}>
                <AlertCircle className="w-4 h-4" />
                <span>{error}</span>
              </div>
            )}

            {/* form */}
            <div className="space-y-4">
              <div style={{ animation: "staggerIn .45s ease-out .02s both" }}>
                <label className="block text-sm font-medium text-cyan-100/90 mb-2">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-cyan-200/60 w-5 h-5" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@company.com"
                    required
                    className="w-full pl-11 pr-4 py-3 rounded-lg bg-white/5 border border-cyan-300/30 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-cyan-300/50 focus:border-transparent transition"
                    style={{ animation: "glowPulse 3s ease-in-out 1s infinite" }}
                  />
                </div>
              </div>

              <div style={{ animation: "staggerIn .45s ease-out .08s both" }}>
                <label className="block text-sm font-medium text-cyan-100/90 mb-2">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-cyan-200/60 w-5 h-5" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    required
                    className="w-full pl-11 pr-11 py-3 rounded-lg bg-white/5 border border-cyan-300/30 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-cyan-300/50 focus:border-transparent transition"
                    style={{ animation: "glowPulse 3s ease-in-out 1.2s infinite" }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-cyan-100/80 hover:text-white"
                    aria-label="Toggle password visibility"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between" style={{ animation: "staggerIn .45s ease-out .14s both" }}>
                <label className="flex items-center gap-2 text-sm text-cyan-100/90 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="h-4 w-4 rounded bg-white/5 border-cyan-300/40 text-cyan-400 focus:ring-cyan-300/40"
                  />
                  Remember me
                </label>
                <button type="button" className="text-sm text-cyan-200 hover:text-white font-medium">
                  Forgot password?
                </button>
              </div>

              {/* primary button */}
              <button
                onClick={handleLogin}
                disabled={isLoading}
                className="relative overflow-hidden w-full py-3 rounded-lg font-medium
                           bg-gradient-to-r from-cyan-500 to-teal-500
                           hover:from-cyan-400 hover:to-teal-500
                           disabled:opacity-50 disabled:cursor-not-allowed
                           flex items-center justify-center gap-2 transition-all shadow-lg hover:shadow-cyan-500/25"
              >
                <span className="relative z-10 inline-flex items-center gap-2">
                  {isLoading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    <>
                      <LogIn className="w-5 h-5" />
                      Sign In
                    </>
                  )}
                </span>
              </button>

              {/* demo */}
              <div className="mt-4 p-3 rounded-lg border border-cyan-300/25 bg-white/5 text-xs text-cyan-100/90" style={{ animation: "fadeUp .45s ease-out .22s both" }}>
                <p className="font-semibold mb-1">Demo Credentials:</p>
                <p>Email: demo@example.com</p>
                <p>Password: demo123</p>
              </div>
            </div>

            <div className="mt-6 text-center" style={{ animation: "fadeUp .45s ease-out .26s both" }}>
              <p className="text-sm text-cyan-100/90">
                Don&apos;t have an account?{" "}
                <button className="text-cyan-200 hover:text-white font-medium">Contact Sales</button>
              </p>
            </div>
          </GlassCard>

          {/* footer */}
          <div className="mt-6 text-center space-y-2" style={{ animation: "fadeUp .5s ease-out .25s both" }}>
            <div className="flex items-center justify-center gap-4 text-sm text-cyan-100/80">
              <button className="hover:text-white">Privacy Policy</button>
              <span>•</span>
              <button className="hover:text-white">Terms of Service</button>
              <span>•</span>
              <button className="hover:text-white">Help</button>
            </div>
            <p className="text-xs text-cyan-100/70">© 2025 PlanForge System · by ARiSE | v1.0.0</p>
          </div>
        </div>
      </div>
    </div>
  );
}
