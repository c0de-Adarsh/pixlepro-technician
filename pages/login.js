import React, { useState, useEffect, useRef } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  Sun,
  Moon,
  ShieldCheck,
  CheckCircle2,
  Smartphone,
  RotateCcw,
  Loader2,
  ArrowLeft,
  KeyRound,
  UserCheck,
} from "lucide-react";
import { useTheme } from "../context/ThemeContext";
import { Api } from "../services/service";
import { goeyToast as toast } from "goey-toast";

export default function LoginPage() {
  const { theme, toggleTheme } = useTheme();
  const router = useRouter();

  // Step 1: "login" (Credentials) | Step 2: "otp" (2FA Verification)
  const [authStep, setAuthStep] = useState("login");

  // Credentials State
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // OTP State (5 digits)
  const [otp, setOtp] = useState(["", "", "", "", ""]);
  const [maskedPhone, setMaskedPhone] = useState("+1 ******8988");
  const [userRole, setUserRole] = useState("admin");
  const [userName, setUserName] = useState("User");
  const [countdown, setCountdown] = useState(30);
  const [canResend, setCanResend] = useState(false);

  const otpInputsRef = useRef([]);

  // Countdown timer for OTP resend
  useEffect(() => {
    let timer;
    if (authStep === "otp" && countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    } else if (countdown === 0) {
      setCanResend(true);
    }
    return () => clearInterval(timer);
  }, [authStep, countdown]);

  // Focus first OTP input on step change
  useEffect(() => {
    if (authStep === "otp") {
      setTimeout(() => {
        otpInputsRef.current[0]?.focus();
      }, 200);
    }
  }, [authStep]);

  // Step 1: Submit Credentials
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Please enter both email and password");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await Api("POST", "auth/login", { email, password }, router);
      if (res && (res.status || res.step === "otp_required")) {
        if (res.step === "otp_required") {
          setMaskedPhone(res.phone_masked || "+1 ******8988");
          setUserRole(res.role || "admin");
          setUserName(res.name || email.split("@")[0]);
          setAuthStep("otp");
          setCountdown(30);
          setCanResend(false);
          setOtp(["", "", "", "", ""]);
          toast.success("Verification code sent! (Use OTP: 77777)");
        } else if (res.data?.token) {
          // Direct login fallback
          completeAuth(res.data.token, res.data.user);
        }
      } else {
        const errMsg = res?.error || res?.message || "Invalid email or password";
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

  // OTP Input handlers
  const handleOtpChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    // Handle paste of whole 5 digits
    if (value.length > 1) {
      const pasted = value.slice(0, 5).split("");
      pasted.forEach((char, i) => {
        if (i < 5) newOtp[i] = char;
      });
      setOtp(newOtp);
      const nextIndex = Math.min(pasted.length, 4);
      otpInputsRef.current[nextIndex]?.focus();
      return;
    }

    newOtp[index] = value;
    setOtp(newOtp);

    // Auto advance
    if (value && index < 4) {
      otpInputsRef.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      otpInputsRef.current[index - 1]?.focus();
    }
  };

  // Step 2: Verify OTP
  const handleVerifyOtp = async (e) => {
    if (e) e.preventDefault();
    const otpCode = otp.join("");
    if (otpCode.length < 5) {
      toast.error("Please enter the complete 5-digit verification code");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await Api("POST", "auth/verify-otp", { email, otp: otpCode }, router);
      if (res && res.status && res.data?.token) {
        toast.success(res.message || "Verification successful!");
        completeAuth(res.data.token, res.data.user);
      } else {
        const errMsg = res?.error || res?.message || "Invalid verification code";
        setError(errMsg);
        toast.error(errMsg);
      }
    } catch (err) {
      const errMsg = err?.error || err?.message || "Verification failed (Use OTP: 77777)";
      setError(errMsg);
      toast.error(errMsg);
    } finally {
      setLoading(false);
    }
  };

  // Resend OTP
  const handleResendOtp = async () => {
    if (!canResend) return;
    try {
      const res = await Api("POST", "auth/resend-otp", { email }, router);
      toast.success(res?.message || "New code sent! (Use OTP: 77777)");
      setCountdown(30);
      setCanResend(false);
      setOtp(["", "", "", "", ""]);
      otpInputsRef.current[0]?.focus();
    } catch (e) {
      toast.error("Failed to resend code");
    }
  };

  // Auto fill test OTP: 77777
  const fillTestOtp = () => {
    const testCode = ["7", "7", "7", "7", "7"];
    setOtp(testCode);
    toast.info("Filled test OTP: 77777");
    setTimeout(() => {
      otpInputsRef.current[4]?.focus();
    }, 100);
  };

  const completeAuth = (token, user) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("token", token || "");
      localStorage.setItem(
        "userDetail",
        JSON.stringify({
          id: user?.id || user?._id || "usr_1",
          name: user?.name || userName,
          email: user?.email || email,
          role: user?.role || userRole,
          phone: user?.phone || maskedPhone,
        })
      );
    }

    if (user?.role === "tech" || user?.role === "technician") {
      toast.success(`Welcome to Technician Portal, ${user?.name || userName}!`);
    } else {
      toast.success(`Welcome back to Admin Dashboard!`);
    }
    router.push("/");
  };

  return (
    <>
      <Head>
        <title>
          {authStep === "otp" ? "Two-Factor Verification - PiXL Pro" : "Login - PiXL Pro Admin"}
        </title>
        <meta name="description" content="Sign in to PiXL Pro Admin & Field Portal" />
      </Head>

      <main className="min-h-screen w-full flex items-center justify-center p-4 relative overflow-hidden transition-colors duration-300">
        {/* Decorative Background Glows */}
        <div className="absolute top-10 left-10 w-96 h-96 bg-[#D31010]/15 dark:bg-[#D31010]/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-blue-500/10 dark:bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />

        {/* Top Right Theme Toggle */}
        <div className="absolute top-6 right-6 z-20">
          <button
            type="button"
            onClick={toggleTheme}
            className="flex items-center gap-2 px-3.5 py-2 bg-white/80 dark:bg-[#0E1E31]/80 backdrop-blur-md border border-slate-200 dark:border-slate-800 rounded-full text-xs font-semibold text-slate-700 dark:text-slate-200 shadow-sm hover:shadow transition-all cursor-pointer"
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

        {/* Card Container with Smooth Animation between Step 1 and Step 2 */}
        <motion.div
          key={authStep}
          initial={{ opacity: 0, y: 15, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -15, scale: 0.98 }}
          transition={{ duration: 0.3 }}
          className="w-full max-w-md bg-white/95 dark:bg-[#0E1E31]/95 backdrop-blur-xl border border-slate-200/90 dark:border-slate-800/90 rounded-3xl p-7 sm:p-8 shadow-2xl z-10 text-slate-900 dark:text-slate-100"
        >
          {/* Logo Header */}
          <div className="flex flex-col items-center text-center mb-6">
            <div className="relative h-14 w-52 mb-2 flex items-center justify-center">
              <img
                src={theme === "dark" ? "/transparentlogo.png" : "/Margin (1).png"}
                alt="PiXL Pro Logo"
                className="h-13 object-contain"
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                  const fallback = e.currentTarget.nextElementSibling;
                  if (fallback) fallback.style.display = "flex";
                }}
              />
              <div className="hidden items-center gap-1.5 font-black text-2xl tracking-tight text-slate-900 dark:text-white">
                <span className="text-[#D31010]">PIXL</span>PRO
              </div>
            </div>
          </div>

          {/* STEP 1: LOGIN FORM */}
          {authStep === "login" && (
            <div className="space-y-6">
              <div className="text-center space-y-1">
                <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
                  Welcome back
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Sign in to your PiXL Pro account
                </p>
              </div>

              {error && (
                <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 rounded-xl text-xs font-bold text-red-600 dark:text-red-400">
                  {error}
                </div>
              )}

              <form onSubmit={handleLoginSubmit} className="space-y-4">
                {/* Email Field */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-extrabold text-slate-700 dark:text-slate-300">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@example.com"
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#D31010]/30 transition-all"
                    />
                  </div>
                </div>

                {/* Password Field */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-extrabold text-slate-700 dark:text-slate-300">
                      Password
                    </label>
                    <button
                      type="button"
                      onClick={() => toast.info("Please contact your administrator to reset password")}
                      className="text-[11px] font-bold text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      Forgot password?
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-10 pr-10 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#D31010]/30 transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Remember Me */}
                <div className="flex items-center justify-between pt-1">
                  <label className="flex items-center gap-2 text-xs font-bold text-slate-600 dark:text-slate-400 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-4 h-4 rounded text-[#D31010] border-slate-300 dark:border-slate-700 focus:ring-[#D31010]"
                    />
                    <span>Remember me</span>
                  </label>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-[#D31010] hover:bg-[#b00d0d] text-white font-extrabold text-xs rounded-xl shadow-lg shadow-red-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Signing in...</span>
                    </>
                  ) : (
                    <>
                      <span>Sign In</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            </div>
          )}

          {/* STEP 2: WORKIZ 2-STEP OTP VERIFICATION SCREEN */}
          {authStep === "otp" && (
            <div className="space-y-6">
              {/* Top 2FA Icon */}
              <div className="flex flex-col items-center text-center space-y-2">
                <div className="w-14 h-14 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 rounded-2xl flex items-center justify-center text-[#D31010] shadow-md shadow-red-500/10">
                  <Smartphone className="w-7 h-7" />
                </div>
                <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
                  Check your phone
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs leading-relaxed">
                  We&apos;ve sent a 5-digit verification code to your registered mobile number:
                </p>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white rounded-full text-xs font-black">
                  <span>{maskedPhone}</span>
                </div>
              </div>

              {error && (
                <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 rounded-xl text-xs font-bold text-red-600 dark:text-red-400 text-center">
                  {error}
                </div>
              )}

              {/* 5 OTP Input Boxes */}
              <div className="space-y-4">
                <div className="flex items-center justify-center gap-2.5 sm:gap-3">
                  {otp.map((digit, idx) => (
                    <input
                      key={idx}
                      ref={(el) => (otpInputsRef.current[idx] = el)}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(idx, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                      className={`w-11 h-13 sm:w-12 sm:h-14 text-center text-xl font-black rounded-2xl border bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white transition-all focus:outline-none focus:ring-2 focus:ring-[#D31010] ${
                        digit
                          ? "border-[#D31010] shadow-sm"
                          : "border-slate-200 dark:border-slate-700"
                      }`}
                    />
                  ))}
                </div>

                {/* Clickable Test OTP Helper Badge */}
                <div className="flex justify-center">
                  <button
                    type="button"
                    onClick={fillTestOtp}
                    className="px-3 py-1.5 bg-blue-50 dark:bg-blue-950/50 hover:bg-blue-100 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-2xs cursor-pointer"
                  >
                    <KeyRound className="w-3.5 h-3.5" />
                    <span>Test OTP: 77777 (Click to auto-fill)</span>
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <button
                  type="button"
                  onClick={handleVerifyOtp}
                  disabled={loading || otp.join("").length < 5}
                  className="w-full py-3 bg-[#D31010] hover:bg-[#b00d0d] text-white font-extrabold text-xs rounded-xl shadow-lg shadow-red-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Verifying code...</span>
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="w-4 h-4" />
                      <span>Verify & Sign In</span>
                    </>
                  )}
                </button>

                {/* Resend Code */}
                <div className="flex items-center justify-between text-xs pt-1 px-1">
                  <button
                    type="button"
                    onClick={() => setAuthStep("login")}
                    className="text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 font-bold flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Back to login</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleResendOtp}
                    disabled={!canResend}
                    className={`font-bold transition-colors ${
                      canResend
                        ? "text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
                        : "text-slate-400 cursor-not-allowed"
                    }`}
                  >
                    {canResend ? "Resend code" : `Resend in ${countdown}s`}
                  </button>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </main>
    </>
  );
}
