import React, { useState } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import { motion } from "framer-motion";
import { Mail, Lock, Eye, EyeOff, ArrowRight, Sun, Moon, ShieldCheck, CheckCircle2 } from "lucide-react";
import { useTheme } from "../context/ThemeContext";
import { Api } from "../services/service";
import { goeyToast as toast } from "goey-toast";

export default function LoginPage() {
  const { theme, toggleTheme } = useTheme();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await Api("POST", "auth/login", { email, password }, router);
      if (res && res.status) {
        toast.success(res.message || "Login successful!");
        if (typeof window !== "undefined") {
          localStorage.setItem("token", res.data?.token || "");
          localStorage.setItem("userDetail", JSON.stringify(res.data?.user || {}));
        }
        router.push("/");
      } else {
        const errMsg = res?.error || res?.message || "Login failed";
        setError(errMsg);
        toast.error(errMsg);
      }
    } catch (err) {
      console.error("Login Error:", err);
      const errMsg = err?.error || err?.message || "Invalid email or password";
      setError(errMsg);
      toast.error(errMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleDemoFill = () => {
    setEmail("pixlproadmin26@gmail.com");
    setPassword("123456");
  };

  return (
    <>
      <Head>
        <title>Login - PiXL Pro Admin</title>
        <meta name="description" content="Sign in to PiXL Pro Admin Dashboard" />
      </Head>

      <main className="min-h-screen w-full flex items-center justify-center p-4 relative overflow-hidden transition-colors duration-300">
        {/* Decorative Background Glows */}
        <div className="absolute top-10 left-10 w-96 h-96 bg-[#D31010]/15 dark:bg-[#D31010]/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-blue-500/10 dark:bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />

        {/* Top Right Theme Toggle */}
        <div className="absolute top-6 right-6 z-20">
          <button
            onClick={toggleTheme}
            className="flex items-center gap-2 px-3.5 py-2 bg-white/80 dark:bg-[#0E1E31]/80 backdrop-blur-md border border-slate-200 dark:border-slate-800 rounded-full text-xs font-semibold text-slate-700 dark:text-slate-200 shadow-sm hover:shadow transition-all"
          >
            {theme === "dark" ? (
              <>
                <Sun className="w-4 h-4 text-amber-400" />
                <span>Light Mode</span>
              </>
            ) : (
              <>
                <Moon className="w-4 h-4 text-slate-600" />
                <span>Dark Mode</span>
              </>
            )}
          </button>
        </div>

        {/* Login Card */}
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-md bg-white/90 dark:bg-[#0E1E31]/90 backdrop-blur-xl border border-slate-200/90 dark:border-slate-800/90 rounded-3xl p-8 shadow-2xl z-10 text-slate-900 dark:text-slate-100"
        >
          {/* Logo Header */}
          <div className="flex flex-col items-center text-center mb-8">
            <div className="relative h-16 w-56 mb-3 flex items-center justify-center">
              <img
                src="/Margin (1).png"
                alt="PiXL Pro Logo"
                className="h-15 object-contain dark:brightness-110"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  const fallback = e.currentTarget.nextElementSibling;
                  if (fallback) fallback.style.display = 'flex';
                }}
              />
              <div className="hidden items-center gap-1.5 font-bold text-3xl tracking-tight text-slate-900 dark:text-white">
                <span className="text-[#D31010]">PIXL</span>PRO
              </div>
            </div>

            <h2 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Welcome back
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Sign in to manage your operations & revenue
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-5">
            {error && (
              <div className="p-3 text-xs bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 rounded-xl">
                {error}
              </div>
            )}

            {/* Email Field */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@pixelpro.com"
                  className="w-full pl-10 pr-4 py-3 text-sm bg-slate-50 dark:bg-slate-900/80 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 border border-slate-200 dark:border-slate-800 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#D31010]/30 focus:border-[#D31010] transition-all"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                  Password
                </label>
                <a href="#forgot" className="text-xs font-semibold text-[#D31010] dark:text-red-400 hover:underline">
                  Forgot?
                </a>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-10 pr-11 py-3 text-sm bg-slate-50 dark:bg-slate-900/80 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 border border-slate-200 dark:border-slate-800 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#D31010]/30 focus:border-[#D31010] transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Remember Me */}
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-slate-300 dark:border-slate-700 text-[#D31010] focus:ring-[#D31010]"
                />
                <span>Remember this device</span>
              </label>

              {/* Demo Credentials Filler */}
              <button
                type="button"
                onClick={handleDemoFill}
                className="text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white underline decoration-dashed"
              >
                Auto-fill Demo
              </button>
            </div>

            {/* Submit Red Button */}
            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 bg-[#D31010] hover:bg-[#b00d0d] text-white font-bold text-sm rounded-2xl shadow-lg shadow-red-500/25 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-75"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>Sign In to Dashboard</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </motion.button>
          </form>

          {/* Quick Demo Dashboard direct button */}
          <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800 text-center">
            <button
              onClick={() => router.push("/")}
              className="text-xs font-semibold text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 transition-colors"
            >
              Skip to Dashboard (Live Preview) &rarr;
            </button>
          </div>
        </motion.div>
      </main>
    </>
  );
}
