import React, { useState } from "react";
import logo from "../assets/logo.png";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { apiLogin, decodeToken } from "../api";

const inputClass =
  "w-full p-3.5 rounded-lg bg-[#1f2937]/50 border border-gray-700/50 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all duration-300";

function LoginPage({ setUser }) {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [wakingUp, setWakingUp] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setWakingUp("");
    setLoading(true);
    try {
      const res = await apiLogin(
        username.trim(),
        password,
        (attempt) => setWakingUp(`⏳ Server is waking up... (attempt ${attempt}/3, please wait)`)
      );
      setWakingUp("");
      const token = res.token;
      sessionStorage.setItem("token", token);

      const payload = decodeToken(token);
      const user = {
        username: payload?.sub || res.user?.username || username,
        role: payload?.role || res.user?.role || "viewer",
        email: payload?.email || res.user?.email || "",
        token,
      };
      setUser(user);
      navigate("/dashboard");
    } catch (err) {
      setWakingUp("");
      setError(err.message || "Login failed. Check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#0b0f19] text-white relative overflow-hidden">
      {/* Background Gradients */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-blue-600/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="z-10 bg-[#111827]/80 backdrop-blur-xl p-10 rounded-2xl border border-blue-500/20 w-full max-w-[440px] shadow-[0_0_40px_rgba(59,130,246,0.15)] mx-4"
      >
        {/* Brand */}
        <div className="flex flex-col items-center mb-8">
          <motion.img
            initial={{ scale: 0.8 }} animate={{ scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            src={logo} alt="AI Ops Logo"
            className="w-16 h-16 mb-4 drop-shadow-[0_0_15px_rgba(56,189,248,0.5)]"
          />
          <h1 className="text-center text-2xl md:text-3xl font-bold mb-2 tracking-tight bg-gradient-to-r from-blue-400 to-cyan-300 text-transparent bg-clip-text">
            AI Ops Enterprise Intelligence
          </h1>
          <p className="text-gray-400 text-center text-sm font-medium">
            Autonomous Multi-Agent Decision Platform
          </p>
        </div>

        {/* Error / Waking Up */}
        <AnimatePresence>
          {wakingUp && (
            <motion.div
              initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="mb-5 px-4 py-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg text-yellow-300 text-sm flex items-center gap-2"
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
              className="mb-5 px-4 py-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm"
            >
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-xs text-gray-400 uppercase tracking-wider mb-2 font-semibold">Username</label>
            <input
              className={inputClass}
              placeholder="Enter your username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-xs text-gray-400 uppercase tracking-wider mb-2 font-semibold">Password</label>
            <input
              type="password"
              className={inputClass}
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
            type="submit" disabled={loading}
            className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 py-3.5 rounded-xl font-semibold text-white shadow-lg hover:shadow-cyan-500/25 transition-all duration-300 mt-4 disabled:opacity-60"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                {wakingUp ? "Connecting..." : "Authenticating..."}
              </span>
            ) : "Sign In to Enterprise Platform"}
          </motion.button>
        </form>

        {/* Dev hint */}
        <div className="mt-5 p-3 bg-blue-500/5 border border-blue-500/10 rounded-lg">
          <p className="text-xs text-gray-500 text-center">
            Default admin: <span className="text-blue-400 font-mono">admin / Admin@123</span>
          </p>
        </div>

        <div className="mt-6 pt-5 border-t border-gray-800 text-center">
          <p className="text-sm text-gray-400">
            Don't have an enterprise account?{" "}
            <span
              onClick={() => navigate("/register")}
              className="text-cyan-400 cursor-pointer hover:text-cyan-300 hover:underline transition-colors font-medium"
            >
              Request Access
            </span>
          </p>
        </div>
      </motion.div>
    </div>
  );
}

export default LoginPage;