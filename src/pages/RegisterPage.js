import React, { useState } from "react";
import logo from "../assets/logo.png";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { apiRegister, apiVerifyOtp, apiResendOtp } from "../api";

const inputClass =
  "w-full p-3.5 rounded-lg bg-[#1f2937]/50 border border-gray-700/50 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all duration-300 text-sm";

function RegisterPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState("register"); // "register" | "otp"
  const [loading, setLoading] = useState(false);
  const [wakingUp, setWakingUp] = useState("");
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [registeredEmail, setRegisteredEmail] = useState("");

  // Form state
  const [form, setForm] = useState({
    username: "",
    email: "",
    phone: "",
    password: "",
    confirm: "",
    role: "viewer",
  });
  const [otp, setOtp] = useState("");

  const setField = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  // ── Register ───────────────────────────────────────────────────────────────
  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    setWakingUp("");
    if (form.password !== form.confirm) {
      setError("Passwords do not match.");
      return;
    }
    setLoading(true);
    try {
      const res = await apiRegister(
        {
          username: form.username,
          email: form.email,
          phone: form.phone,
          password: form.password,
          role: form.role,
        },
        (attempt, total) => setWakingUp(`⏳ Server is waking up... (attempt ${attempt}/${total}, please wait ~${total * 8}s)`)
      );
      setWakingUp("");
      setRegisteredEmail(form.email);
      setSuccessMsg(res.message || "OTP sent to your email.");
      setStep("otp");
    } catch (err) {
      setWakingUp("");
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // ── Verify OTP ─────────────────────────────────────────────────────────────
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError("");
    if (!otp.trim()) { setError("Please enter the OTP."); return; }
    setLoading(true);
    try {
      await apiVerifyOtp(registeredEmail, otp.trim());
      setSuccessMsg("✅ Account verified! Redirecting to login...");
      setTimeout(() => navigate("/login"), 1800);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setError(""); setSuccessMsg("");
    try {
      const r = await apiResendOtp(registeredEmail);
      setSuccessMsg(r.message);
    } catch (err) { setError(err.message); }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#0b0f19] text-white relative overflow-hidden">
      <div className="absolute bottom-[-20%] left-[-10%] w-[50%] h-[50%] bg-blue-600/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-[-20%] right-[-10%] w-[50%] h-[50%] bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="z-10 bg-[#111827]/80 backdrop-blur-xl p-10 rounded-2xl border border-blue-500/20 w-full max-w-[480px] shadow-[0_0_40px_rgba(59,130,246,0.15)] mx-4"
      >
        {/* Brand */}
        <div className="flex flex-col items-center mb-7">
          <motion.img
            initial={{ scale: 0.8 }} animate={{ scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            src={logo} alt="Logo"
            className="w-14 h-14 mb-3 drop-shadow-[0_0_15px_rgba(56,189,248,0.5)]"
          />
          <h1 className="text-center text-2xl font-bold tracking-tight bg-gradient-to-r from-blue-400 to-cyan-300 text-transparent bg-clip-text">
            {step === "register" ? "Create Enterprise Account" : "Verify Your Email"}
          </h1>
          <p className="text-gray-400 text-center text-xs mt-1">
            {step === "register"
              ? "Join the Autonomous Intelligence Platform"
              : `OTP sent to ${registeredEmail}`}
          </p>
        </div>

        {/* Error / Success / Waking Up */}
        <AnimatePresence>
          {wakingUp && (
            <motion.div
              initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="mb-4 px-4 py-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg text-yellow-300 text-sm flex items-center gap-2"
            >
              <svg className="animate-spin w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              {wakingUp}
            </motion.div>
          )}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="mb-4 px-4 py-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm"
            >
              {error}
            </motion.div>
          )}
          {successMsg && (
            <motion.div
              initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="mb-4 px-4 py-3 bg-green-500/10 border border-green-500/30 rounded-lg text-green-400 text-sm"
            >
              {successMsg}
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── STEP 1: Register Form ─────────────────────────────────────────── */}
        {step === "register" && (
          <form onSubmit={handleRegister} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-gray-400 uppercase tracking-wider mb-1.5 font-semibold">Username</label>
                <input className={inputClass} placeholder="e.g. john_doe" value={form.username} onChange={setField("username")} required />
              </div>
              <div>
                <label className="block text-xs text-gray-400 uppercase tracking-wider mb-1.5 font-semibold">Phone</label>
                <input className={inputClass} placeholder="+1 234 567 890" value={form.phone} onChange={setField("phone")} required />
              </div>
            </div>

            <div>
              <label className="block text-xs text-gray-400 uppercase tracking-wider mb-1.5 font-semibold">Email Address</label>
              <input type="email" className={inputClass} placeholder="you@company.com" value={form.email} onChange={setField("email")} required />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-gray-400 uppercase tracking-wider mb-1.5 font-semibold">Password</label>
                <input type="password" className={inputClass} placeholder="Min 6 chars" value={form.password} onChange={setField("password")} required />
              </div>
              <div>
                <label className="block text-xs text-gray-400 uppercase tracking-wider mb-1.5 font-semibold">Confirm</label>
                <input type="password" className={inputClass} placeholder="Repeat password" value={form.confirm} onChange={setField("confirm")} required />
              </div>
            </div>

            <div>
              <label className="block text-xs text-gray-400 uppercase tracking-wider mb-1.5 font-semibold">System Role</label>
              <select className={inputClass} value={form.role} onChange={setField("role")}>
                <option value="viewer" className="bg-[#1f2937]">Viewer — Dashboard Only</option>
                <option value="analyst" className="bg-[#1f2937]">Analyst — Run AI Agents</option>
                <option value="admin" className="bg-[#1f2937]">Admin — Full System Access</option>
              </select>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              type="submit" disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 py-3.5 rounded-xl font-semibold text-white shadow-lg hover:shadow-cyan-500/25 transition-all duration-300 mt-2 disabled:opacity-60"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  {wakingUp ? "Connecting..." : "Creating Account..."}
                </span>
              ) : "Create Enterprise Account"}
            </motion.button>
          </form>
        )}

        {/* ── STEP 2: OTP Verification ──────────────────────────────────────── */}
        {step === "otp" && (
          <form onSubmit={handleVerifyOtp} className="space-y-5">
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <p className="text-gray-400 text-sm">
                Enter the 6-digit code sent to your email.<br />
                <span className="text-xs text-gray-500">(Also printed in the backend console for development)</span>
              </p>
            </div>

            <div>
              <label className="block text-xs text-gray-400 uppercase tracking-wider mb-2 font-semibold text-center">One-Time Password</label>
              <input
                className="w-full p-4 rounded-lg bg-[#1f2937]/50 border border-cyan-500/30 text-white text-center text-3xl tracking-[1rem] font-mono placeholder-gray-600 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all"
                placeholder="● ● ● ● ● ●"
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/, ""))}
                required
              />
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              type="submit" disabled={loading}
              className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 py-3.5 rounded-xl font-semibold text-white shadow-lg hover:shadow-cyan-500/25 transition-all duration-300 disabled:opacity-60"
            >
              {loading ? "Verifying..." : "Verify & Activate Account"}
            </motion.button>

            <button type="button" onClick={handleResend}
              className="w-full text-sm text-gray-500 hover:text-cyan-400 transition-colors mt-1">
              Didn't receive it? Resend OTP
            </button>
          </form>
        )}

        <div className="mt-6 pt-5 border-t border-gray-800 text-center">
          <p className="text-sm text-gray-400">
            Already have an account?{" "}
            <span onClick={() => navigate("/login")}
              className="text-cyan-400 cursor-pointer hover:text-cyan-300 hover:underline transition-colors font-medium">
              Sign In
            </span>
          </p>
        </div>
      </motion.div>
    </div>
  );
}

export default RegisterPage;