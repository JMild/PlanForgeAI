"use client";
import React, { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, LogIn, AlertCircle, Factory, Cpu, BarChart3, Users } from 'lucide-react';
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('demo@example.com');
  const [password, setPassword] = useState('demo123');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async () => {
    setError('');
    setIsLoading(true);

    // Simulate login
    setTimeout(() => {
      if (email === 'demo@example.com' && password === 'demo123') {
        router.push("/dashboard");
      } else {
        setError('Invalid email or password. Try demo@example.com / demo123');
      }
      setIsLoading(false);
    }, 1500);
  };

  const handleForgot = () => {
    router.push("/auth/forgot");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-purple-600 to-blue-800 flex">
      {/* Left Side - Branding & Features */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12 text-white">
        <div>
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 bg-white bg-opacity-20 backdrop-blur rounded-xl flex items-center justify-center">
              <Factory className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">PlanForgeAI</h1>
              <p className="text-sm text-blue-100">Smart Manufacturing Solutions</p>
            </div>
          </div>

          <div className="space-y-8 mt-16">
            <h2 className="text-4xl font-bold leading-tight">
              Optimize Your<br />Production Schedule<br />with AI
            </h2>
            <p className="text-xl text-blue-100 max-w-md">
              Intelligent planning, real-time visibility, and seamless execution for modern manufacturing
            </p>

            <div className="space-y-4 mt-12">
              {[
                { icon: Cpu, title: 'AI-Powered Scheduling', desc: 'Genetic algorithms optimize for on-time delivery, utilization, and cost' },
                { icon: BarChart3, title: 'Real-Time Analytics', desc: 'Track KPIs, bottlenecks, and performance metrics instantly' },
                { icon: Users, title: 'Skill-Based Assignment', desc: 'Match jobs to qualified personnel and available resources' },
              ].map((feature, idx) => {
                const Icon = feature.icon;
                return (
                  <div key={idx} className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-white bg-opacity-20 backdrop-blur rounded-lg flex items-center justify-center flex-shrink-0">
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">{feature.title}</h3>
                      <p className="text-sm text-blue-100">{feature.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* <div className="space-y-4">
          <div className="flex items-center gap-2 text-sm text-blue-100">
            <Shield className="w-4 h-4" />
            <span>Enterprise-grade security with SSO/OIDC support</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-blue-100">
            <CheckCircle className="w-4 h-4" />
            <span>ISO 27001 certified • GDPR compliant</span>
          </div>
        </div> */}
      </div>

      {/* Right Side - Login Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center justify-center gap-3 mb-8 text-white">
            <div className="w-12 h-12 bg-white bg-opacity-20 backdrop-blur rounded-xl flex items-center justify-center">
              <Factory className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-xl font-bold">PlanForgeAI</h1>
            </div>
          </div>

          {/* Login Card */}
          <div className="bg-white rounded-2xl shadow-2xl p-8">
          {/* <div className="rounded-2xl p-8 bg-white/10 backdrop-blur-md border border-white/20 shadow-xl"> */}
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Welcome Back</h2>
              <p className="text-gray-600">Sign in to your account to continue</p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-800 text-sm">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Login Form */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@company.com"
                    required
                    className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    required
                    className="w-full pl-11 pr-11 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">Remember me</span>
                </label>
                <button
                  type="button"
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                  onClick={handleForgot}
                >
                  Forgot password?
                </button>
              </div>

              <button
                onClick={handleLogin}
                disabled={isLoading}
                className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all shadow-lg hover:shadow-xl"
              >
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
              </button>

              {/* Demo Credentials */}
              <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-xs font-semibold text-blue-900 mb-1">Demo Credentials:</p>
                <p className="text-xs text-blue-700">Email: demo@acme.com</p>
                <p className="text-xs text-blue-700">Password: demo123</p>
              </div>
            </div>

            {/* Sign Up Link */}
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Don&#39;t have an account?{' '}
                <button className="text-blue-600 hover:text-blue-700 font-medium">
                  Contact Sales
                </button>
              </p>
            </div>
          </div>

          {/* Footer Links */}
          <div className="mt-6 text-center space-y-2">
            <div className="flex items-center justify-center gap-4 text-sm text-white text-opacity-80">
              <button className="hover:text-white">Privacy Policy</button>
              <span>•</span>
              <button className="hover:text-white">Terms of Service</button>
              <span>•</span>
              <button className="hover:text-white">Help</button>
            </div>
            <p className="text-xs text-white text-opacity-60">
              © 2025 PlanForge System · by ARiSE | v1.0.0
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};