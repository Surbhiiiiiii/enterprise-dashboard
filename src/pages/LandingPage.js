import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion, useInView, AnimatePresence } from "framer-motion";
import logo from "../assets/logo.png";
import {
  FaBrain, FaBolt, FaShieldAlt, FaChartLine, FaRobot, FaCheckCircle,
  FaTwitter, FaLinkedin, FaGithub, FaPlay, FaAngleDown, FaStar,
  FaNetworkWired, FaCogs, FaEye, FaUserTie, FaUserSecret
} from "react-icons/fa";
import { LineChart, Line, ResponsiveContainer, AreaChart, Area, Tooltip } from "recharts";

// ─── Animated Counter ───────────────────────────────────────────────────────
function Counter({ end, suffix = "", prefix = "" }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  useEffect(() => {
    if (!inView) return;
    let start = 0;
    const duration = 2000;
    const step = Math.ceil(end / (duration / 16));
    const timer = setInterval(() => {
      start += step;
      if (start >= end) { setCount(end); clearInterval(timer); }
      else setCount(start);
    }, 16);
    return () => clearInterval(timer);
  }, [inView, end]);
  return <span ref={ref}>{prefix}{count.toLocaleString()}{suffix}</span>;
}

// ─── Animated Particle Canvas ───────────────────────────────────────────────
function ParticleCanvas() {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const particles = Array.from({ length: 80 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      r: Math.random() * 1.5 + 0.5,
      opacity: Math.random() * 0.5 + 0.1,
    }));
    let animId;
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(p => {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(99,102,241,${p.opacity})`;
        ctx.fill();
      });
      particles.forEach((p, i) => {
        particles.slice(i + 1).forEach(q => {
          const d = Math.hypot(p.x - q.x, p.y - q.y);
          if (d < 120) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(q.x, q.y);
            ctx.strokeStyle = `rgba(99,102,241,${0.15 * (1 - d / 120)})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        });
      });
      animId = requestAnimationFrame(draw);
    };
    draw();
    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
    window.addEventListener("resize", resize);
    return () => { cancelAnimationFrame(animId); window.removeEventListener("resize", resize); };
  }, []);
  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" />;
}

// ─── Cursor Glow ────────────────────────────────────────────────────────────
function CursorGlow() {
  const [pos, setPos] = useState({ x: -200, y: -200 });
  useEffect(() => {
    const move = e => setPos({ x: e.clientX, y: e.clientY });
    window.addEventListener("mousemove", move);
    return () => window.removeEventListener("mousemove", move);
  }, []);
  return (
    <div
      className="fixed pointer-events-none z-50 rounded-full"
      style={{
        left: pos.x - 150, top: pos.y - 150, width: 300, height: 300,
        background: "radial-gradient(circle, rgba(99,102,241,0.08) 0%, transparent 70%)",
        transition: "left 0.05s, top 0.05s",
      }}
    />
  );
}

// ─── Section Wrapper ─────────────────────────────────────────────────────────
function RevealSection({ children, className = "", delay = 0 }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  return (
    <motion.div ref={ref} initial={{ opacity: 0, y: 40 }} animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, delay, ease: "easeOut" }} className={className}>
      {children}
    </motion.div>
  );
}

// ─── Fake Live Log ───────────────────────────────────────────────────────────
const LOG_LINES = [
  { t: "14:32:01", msg: "Agent Planner activated — goal: 'Monitor API health'", type: "info" },
  { t: "14:32:02", msg: "AnalystAgent fetching incident logs from data pipeline...", type: "info" },
  { t: "14:32:04", msg: "⚠  Anomaly detected: API response time > 8000ms", type: "warn" },
  { t: "14:32:05", msg: "RootCause Engine: Backend service load spike identified", type: "warn" },
  { t: "14:32:06", msg: "Severity classified: HIGH — escalating to ExecutorAgent", type: "error" },
  { t: "14:32:07", msg: "ExecutorAgent: Initiating service restart for api-gateway-v2...", type: "info" },
  { t: "14:32:09", msg: "✓ Service restarted successfully. Response time: 180ms", type: "success" },
  { t: "14:32:10", msg: "CriticAgent: Evaluating outcome — accuracy 97.4%", type: "success" },
  { t: "14:32:11", msg: "MetaAgent: Prompt optimized for future API scenarios", type: "meta" },
  { t: "14:32:12", msg: "Strategy DB updated. Memory persisted. Cycle complete.", type: "success" },
];

function LiveLogs() {
  const [visibleLines, setVisibleLines] = useState([]);
  const [idx, setIdx] = useState(0);
  useEffect(() => {
    if (idx >= LOG_LINES.length) {
      const reset = setTimeout(() => { setVisibleLines([]); setIdx(0); }, 3000);
      return () => clearTimeout(reset);
    }
    const t = setTimeout(() => {
      setVisibleLines(prev => [...prev, LOG_LINES[idx]]);
      setIdx(i => i + 1);
    }, 700);
    return () => clearTimeout(t);
  }, [idx]);
  const colors = { info: "text-blue-400", warn: "text-yellow-400", error: "text-red-400", success: "text-emerald-400", meta: "text-purple-400" };
  return (
    <div className="font-mono text-xs space-y-1 h-52 overflow-hidden">
      <AnimatePresence>
        {visibleLines.map((line, i) => (
          <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="flex gap-2">
            <span className="text-gray-500 shrink-0">{line.t}</span>
            <span className={colors[line.type]}>{line.msg}</span>
          </motion.div>
        ))}
      </AnimatePresence>
      {idx < LOG_LINES.length && (
        <motion.span animate={{ opacity: [1, 0, 1] }} transition={{ repeat: Infinity, duration: 0.8 }} className="text-indigo-400">▌</motion.span>
      )}
    </div>
  );
}

// ─── Typing Effect ───────────────────────────────────────────────────────────
function TypingText({ texts }) {
  const [phase, setPhase] = useState(0);
  const [displayed, setDisplayed] = useState("");
  const [charIdx, setCharIdx] = useState(0);
  const [deleting, setDeleting] = useState(false);
  useEffect(() => {
    const current = texts[phase % texts.length];
    if (!deleting && charIdx <= current.length) {
      const t = setTimeout(() => { setDisplayed(current.slice(0, charIdx)); setCharIdx(c => c + 1); }, 60);
      return () => clearTimeout(t);
    }
    if (!deleting && charIdx > current.length) {
      const t = setTimeout(() => setDeleting(true), 1800);
      return () => clearTimeout(t);
    }
    if (deleting && charIdx >= 0) {
      const t = setTimeout(() => { setDisplayed(current.slice(0, charIdx)); setCharIdx(c => c - 1); }, 30);
      return () => clearTimeout(t);
    }
    if (deleting && charIdx < 0) {
      setDeleting(false); setPhase(p => p + 1); setCharIdx(0);
    }
  }, [charIdx, deleting, phase, texts]);
  return (
    <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">
      {displayed}<motion.span animate={{ opacity: [1, 0] }} transition={{ repeat: Infinity, duration: 0.6 }}>|</motion.span>
    </span>
  );
}

// ─── Sample chart data ───────────────────────────────────────────────────────
const chartData = [
  { v: 40 }, { v: 65 }, { v: 45 }, { v: 80 }, { v: 55 }, { v: 90 }, { v: 60 }, { v: 95 }, { v: 70 }, { v: 100 }
];
const evolutionData = [
  { d: "W1", eff: 55 }, { d: "W2", eff: 62 }, { d: "W3", eff: 70 }, { d: "W4", eff: 78 },
  { d: "W5", eff: 85 }, { d: "W6", eff: 88 }, { d: "W7", eff: 93 }, { d: "W8", eff: 97 }
];

// ─── Features Data ────────────────────────────────────────────────────────────
const FEATURES = [
  {
    icon: <FaBolt className="text-yellow-400" />,
    title: "Autonomous Incident Detection",
    desc: "Real-time monitoring across all enterprise systems. Anomalies are detected within milliseconds using AI-powered pattern recognition.",
    glow: "from-yellow-500/20 to-orange-500/10",
    border: "border-yellow-500/20",
  },
  {
    icon: <FaBrain className="text-purple-400" />,
    title: "Root Cause Intelligence Engine",
    desc: "Multi-layer causal analysis using RAG (Retrieval-Augmented Generation) to pinpoint the exact origin of every operational failure.",
    glow: "from-purple-500/20 to-indigo-500/10",
    border: "border-purple-500/20",
  },
  {
    icon: <FaShieldAlt className="text-cyan-400" />,
    title: "Predictive Failure Prevention",
    desc: "Historical trend analysis and ML inference models predict system degradation before incidents occur — stopping fires before they start.",
    glow: "from-cyan-500/20 to-blue-500/10",
    border: "border-cyan-500/20",
  },
  {
    icon: <FaCogs className="text-emerald-400" />,
    title: "Real-Time Decision Execution",
    desc: "The ExecutorAgent takes verified, multi-step automated actions — restarts, escalations, rollbacks — with zero human lag.",
    glow: "from-emerald-500/20 to-teal-500/10",
    border: "border-emerald-500/20",
  },
  {
    icon: <FaNetworkWired className="text-rose-400" />,
    title: "Self-Improving Meta-Agent System",
    desc: "A second layer of AI agents continuously evaluates performance, optimises prompts, and updates the strategy database autonomously.",
    glow: "from-rose-500/20 to-pink-500/10",
    border: "border-rose-500/20",
  },
];

// ─── Pricing ──────────────────────────────────────────────────────────────────
const PLANS = [
  { name: "Starter", price: "$0", period: "/mo", highlight: false, features: ["5 Agents", "1,000 incidents/mo", "Basic Analytics", "Community Support"], cta: "Get Started" },
  { name: "Pro", price: "$149", period: "/mo", highlight: true, features: ["Unlimited Agents", "50,000 incidents/mo", "Meta-Agent Layer", "Priority Support", "Custom Dashboards", "API Access"], cta: "Start Free Trial" },
  { name: "Enterprise", price: "Custom", period: "", highlight: false, features: ["Unlimited Everything", "Dedicated Infrastructure", "SLA Guarantee", "Custom Integrations", "White-label Option", "24/7 Support"], cta: "Contact Sales" },
];

// ─── FAQ ──────────────────────────────────────────────────────────────────────
const FAQS = [
  { q: "How does autonomous decision-making work?", a: "SE-AEIS uses a multi-agent pipeline: the Planner Agent breaks down goals, the Analyst Agent identifies issues using RAG, and the Executor Agent takes verified actions — all without human intervention." },
  { q: "Is human intervention required?", a: "No. The system is fully autonomous. However, admins can configure thresholds, review action logs, and override decisions via the admin dashboard at any time." },
  { q: "How does self-improvement happen?", a: "A dedicated Meta-Agent Layer runs after each investigation cycle. It evaluates performance scores, rewrites agent prompts for better accuracy, and updates the strategy database automatically." },
  { q: "What data sources can it connect to?", a: "SE-AEIS ingests CSV/JSON/TXT datasets, live API endpoints, web URLs, and streaming log files. Custom connectors can be built via the plugin API." },
  { q: "Is my enterprise data secure?", a: "Yes. All data is processed locally within your infrastructure. No data leaves your environment. We use AES-256 encryption at rest and TLS 1.3 in transit." },
];

// ─── Testimonials ─────────────────────────────────────────────────────────────
const TESTIMONIALS = [
  { name: "Sarah Chen", role: "VP Engineering, NovaTech Corp", text: "SE-AEIS reduced our mean time to resolution by 87%. It detected a cascading failure in our microservices and resolved it before our on-call engineer even got the page.", stars: 5, initials: "SC", color: "from-indigo-500 to-purple-600" },
  { name: "Marcus Williams", role: "CTO, Fusion Analytics", text: "We replaced our entire manual monitoring team with SE-AEIS. The self-improving meta-agents are genuinely impressive — the system gets smarter every week.", stars: 5, initials: "MW", color: "from-cyan-500 to-blue-600" },
  { name: "Priya Sharma", role: "Head of Infrastructure, Apex Global", text: "The Predictive Prevention feature alone saved us from three major outages last quarter. The ROI was immediate. This is the future of enterprise operations.", stars: 5, initials: "PS", color: "from-emerald-500 to-teal-600" },
];

// ─── Agent Flow ───────────────────────────────────────────────────────────────
const AGENTS = [
  { num: "01", name: "Planner Agent", desc: "Breaks down the enterprise goal into structured sub-tasks", color: "indigo" },
  { num: "02", name: "Analyst Agent", desc: "Analyzes data using RAG, keywords, and trend detection", color: "purple" },
  { num: "03", name: "Executor Agent", desc: "Performs real automated actions on enterprise systems", color: "cyan" },
  { num: "04", name: "Critic Agent", desc: "Evaluates outcomes and generates quality feedback", color: "emerald" },
];
const META_AGENTS = [
  { name: "Performance Evaluator", icon: <FaChartLine /> },
  { name: "Strategy Optimizer", icon: <FaBrain /> },
  { name: "Prompt Optimizer", icon: <FaBolt /> },
  { name: "Memory System", icon: <FaNetworkWired /> },
];

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
export default function LandingPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("admin");
  const [openFaq, setOpenFaq] = useState(null);
  const [navScrolled, setNavScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setNavScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollTo = useCallback((id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  }, []);

  return (
    <div className="bg-[#050814] text-white min-h-screen overflow-x-hidden font-sans">
      <CursorGlow />

      {/* ── NAV ──────────────────────────────────────────────────────────── */}
      <header className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${navScrolled ? "bg-[#050814]/90 backdrop-blur-xl border-b border-white/5 shadow-lg" : ""}`}>
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={logo} alt="SE-AEIS Logo" className="w-9 h-9 object-contain drop-shadow-[0_0_8px_rgba(99,102,241,0.6)]" />
            <span className="font-bold text-lg tracking-tight">SE<span className="text-indigo-400">-AEIS</span></span>
          </div>
          <nav className="hidden md:flex items-center gap-8 text-sm text-gray-400">
            {["features", "how-it-works", "pricing", "faq"].map(s => (
              <button key={s} onClick={() => scrollTo(s)} className="hover:text-white transition capitalize">
                {s.replace("-", " ")}
              </button>
            ))}
          </nav>
          <div className="flex items-center gap-3">
            <button onClick={() => navigate("/login")} className="text-sm text-gray-400 hover:text-white transition px-4 py-2">Log In</button>
            <button onClick={() => navigate("/register")} className="text-sm bg-indigo-600 hover:bg-indigo-500 transition px-5 py-2 rounded-lg font-medium shadow-lg shadow-indigo-500/30">
              Get Started
            </button>
          </div>
        </div>
      </header>

      {/* ── HERO ─────────────────────────────────────────────────────────── */}
      <section className="relative min-h-screen flex flex-col items-center justify-center text-center px-6 pt-20 overflow-hidden">
        <ParticleCanvas />
        {/* Glow blobs */}
        <div className="absolute w-[700px] h-[700px] bg-indigo-600/10 rounded-full blur-[120px] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
        <div className="absolute w-[400px] h-[400px] bg-purple-600/10 rounded-full blur-[100px] top-20 right-20 pointer-events-none" />

        <div className="relative z-10 max-w-5xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <span className="inline-flex items-center gap-2 text-xs font-semibold px-4 py-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 text-indigo-300 mb-8">
              <motion.span animate={{ scale: [1, 1.3, 1] }} transition={{ repeat: Infinity, duration: 1.5 }} className="w-1.5 h-1.5 rounded-full bg-indigo-400 inline-block" />
              World's First Self-Evolving Enterprise AI
            </span>
          </motion.div>

          <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.1 }}
            className="text-5xl md:text-7xl font-extrabold tracking-tight leading-tight mb-6">
            Your Enterprise.<br />
            <TypingText texts={["Fully Autonomous.", "Fully Intelligent.", "Always Evolving."]} />
          </motion.h1>

          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.25 }}
            className="text-gray-400 text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
            SE-AEIS detects, analyzes, and resolves operational issues in real-time — while <span className="text-white font-semibold">continuously improving itself</span> through a self-optimizing meta-agent layer.
          </motion.p>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.35 }}
            className="flex flex-wrap items-center justify-center gap-4 mb-16">
            <button onClick={() => navigate("/register")}
              className="group flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 transition-all px-8 py-4 rounded-xl font-semibold text-white shadow-xl shadow-indigo-500/30 hover:shadow-indigo-500/50 hover:-translate-y-0.5">
              Start Free Trial
              <motion.span animate={{ x: [0, 4, 0] }} transition={{ repeat: Infinity, duration: 1.5 }}>→</motion.span>
            </button>
            <button onClick={() => scrollTo("preview")}
              className="flex items-center gap-2 border border-white/10 hover:border-white/20 bg-white/5 hover:bg-white/10 transition-all px-8 py-4 rounded-xl font-semibold text-gray-300">
              <FaPlay className="text-xs" /> Watch Live Demo
            </button>
          </motion.div>

          {/* Stats */}
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.5 }}
            className="grid grid-cols-3 gap-8 max-w-2xl mx-auto mb-16">
            {[
              { end: 10000, suffix: "+", label: "Incidents Resolved", prefix: "" },
              { end: 98, suffix: "%", label: "Faster Response Time", prefix: "" },
              { end: 0, suffix: "", label: "Human Intervention Required", prefix: "" },
            ].map((s, i) => (
              <div key={i} className="text-center">
                <div className="text-3xl md:text-4xl font-extrabold text-white mb-1">
                  <Counter end={s.end} suffix={s.suffix} prefix={s.prefix} />
                </div>
                <div className="text-xs text-gray-500">{s.label}</div>
              </div>
            ))}
          </motion.div>

          {/* Floating status cards */}
          <div className="flex flex-wrap justify-center gap-4">
            {[
              { icon: "⚠", text: "Incident Detected", color: "border-yellow-500/30 bg-yellow-500/5 text-yellow-400", delay: 0 },
              { icon: "🔍", text: "Root Cause Identified", color: "border-blue-500/30 bg-blue-500/5 text-blue-400", delay: 0.4 },
              { icon: "✓", text: "Action Executed", color: "border-emerald-500/30 bg-emerald-500/5 text-emerald-400", delay: 0.8 },
            ].map((c, i) => (
              <motion.div key={i}
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 3, repeat: Infinity, delay: c.delay, ease: "easeInOut" }}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl border text-sm font-medium backdrop-blur-sm ${c.color}`}>
                <span>{c.icon}</span>{c.text}
              </motion.div>
            ))}
          </div>
        </div>

        {/* Scroll indicator */}
        <motion.div animate={{ y: [0, 8, 0] }} transition={{ repeat: Infinity, duration: 2 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 text-gray-600 flex flex-col items-center gap-1 text-xs">
          <span>Scroll to explore</span>
          <FaAngleDown />
        </motion.div>
      </section>

      {/* ── LIVE SYSTEM PREVIEW ─────────────────────────────────────────── */}
      <section id="preview" className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <RevealSection className="text-center mb-12">
            <p className="text-indigo-400 text-sm font-semibold uppercase tracking-widest mb-3">Live System Preview</p>
            <h2 className="text-4xl md:text-5xl font-bold mb-4">Watch AI Operate in Real-Time</h2>
            <p className="text-gray-400 max-w-xl mx-auto">Every decision logged. Every action verified. Every cycle smarter than the last.</p>
          </RevealSection>

          <RevealSection delay={0.2}>
            <div className="rounded-2xl border border-white/10 bg-[#0a0f1e]/80 backdrop-blur-xl overflow-hidden shadow-2xl shadow-indigo-500/10">
              {/* Window chrome */}
              <div className="flex items-center gap-2 px-4 py-3 border-b border-white/5 bg-white/2">
                <div className="w-3 h-3 rounded-full bg-red-500/60" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
                <div className="w-3 h-3 rounded-full bg-emerald-500/60" />
                <div className="ml-4 flex-1 bg-white/5 rounded-md px-3 py-1 text-xs text-gray-500 font-mono">se-aeis://enterprise-intelligence.live</div>
                <motion.span animate={{ opacity: [1, 0.3, 1] }} transition={{ repeat: Infinity, duration: 1.5 }}
                  className="text-xs text-emerald-400 font-mono">● LIVE</motion.span>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-0 divide-y lg:divide-y-0 lg:divide-x divide-white/5">
                {/* Log panel */}
                <div className="lg:col-span-2 p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-xs font-mono text-gray-400 uppercase tracking-wider">Agent Activity Stream</span>
                  </div>
                  <LiveLogs />
                </div>

                {/* Analysis panel */}
                <div className="p-6 space-y-4">
                  <div className="text-xs font-mono text-gray-400 uppercase tracking-wider mb-4">AI Analysis</div>
                  <div className="space-y-3">
                    <div className="rounded-xl bg-red-500/10 border border-red-500/20 p-3">
                      <div className="text-[10px] text-red-400 font-semibold uppercase mb-1">Detected Issue</div>
                      <div className="text-xs text-gray-300">API Timeout — avg 8.4s response</div>
                    </div>
                    <div className="rounded-xl bg-yellow-500/10 border border-yellow-500/20 p-3">
                      <div className="text-[10px] text-yellow-400 font-semibold uppercase mb-1">Root Cause</div>
                      <div className="text-xs text-gray-300">Backend service memory saturation</div>
                    </div>
                    <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-3">
                      <div className="text-[10px] text-emerald-400 font-semibold uppercase mb-1">Action Taken</div>
                      <div className="text-xs text-gray-300">Service restarted — 180ms restored</div>
                    </div>
                    <div className="rounded-xl bg-indigo-500/10 border border-indigo-500/20 p-3">
                      <div className="text-[10px] text-indigo-400 font-semibold uppercase mb-1">AI Confidence</div>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
                          <motion.div initial={{ width: 0 }} animate={{ width: "97%" }}
                            transition={{ duration: 2, delay: 1 }} className="h-full bg-indigo-400 rounded-full" />
                        </div>
                        <span className="text-xs text-indigo-300 font-mono">97%</span>
                      </div>
                    </div>
                  </div>
                  <div className="pt-2">
                    <div className="text-[10px] text-gray-500 mb-2 uppercase tracking-wider">Trend (7d)</div>
                    <ResponsiveContainer width="100%" height={50}>
                      <AreaChart data={chartData}>
                        <defs>
                          <linearGradient id="cg" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <Area type="monotone" dataKey="v" stroke="#6366f1" strokeWidth={2} fill="url(#cg)" dot={false} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </div>
          </RevealSection>
        </div>
      </section>

      {/* ── FEATURES ──────────────────────────────────────────────────────── */}
      <section id="features" className="py-24 px-6 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-indigo-950/10 to-transparent pointer-events-none" />
        <div className="max-w-7xl mx-auto">
          <RevealSection className="text-center mb-16">
            <p className="text-indigo-400 text-sm font-semibold uppercase tracking-widest mb-3">Capabilities</p>
            <h2 className="text-4xl md:text-5xl font-bold mb-4">Not Features. Superpowers.</h2>
            <p className="text-gray-400 max-w-xl mx-auto">Each capability is a distinct AI-driven system working in concert to keep your enterprise operating at peak efficiency.</p>
          </RevealSection>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map((f, i) => (
              <RevealSection key={i} delay={i * 0.1}>
                <motion.div whileHover={{ y: -6, scale: 1.02 }} transition={{ duration: 0.25 }}
                  className={`relative group rounded-2xl border ${f.border} p-6 bg-gradient-to-br ${f.glow} overflow-hidden cursor-default h-full`}>
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-br from-white/3 to-transparent rounded-2xl" />
                  <div className="text-2xl mb-4 w-12 h-12 rounded-xl bg-black/30 flex items-center justify-center border border-white/5">{f.icon}</div>
                  <h3 className="text-lg font-bold text-white mb-2">{f.title}</h3>
                  <p className="text-sm text-gray-400 leading-relaxed">{f.desc}</p>
                  <div className="mt-4 pt-4 border-t border-white/5">
                    <ResponsiveContainer width="100%" height={40}>
                      <AreaChart data={chartData.map(d => ({ v: d.v + i * 3 - 10 }))}>
                        <defs>
                          <linearGradient id={`fg${i}`} x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2} />
                            <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <Area type="monotone" dataKey="v" stroke="#6366f1" strokeWidth={1.5} fill={`url(#fg${i})`} dot={false} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </motion.div>
              </RevealSection>
            ))}

            {/* Wide analytics card */}
            <RevealSection delay={0.5} className="md:col-span-2 lg:col-span-2">
              <motion.div whileHover={{ y: -4 }} transition={{ duration: 0.25 }}
                className="rounded-2xl border border-indigo-500/20 p-6 bg-gradient-to-br from-indigo-500/10 to-purple-500/5 h-full">
                <div className="flex items-center gap-2 mb-4">
                  <FaChartLine className="text-indigo-400 text-2xl" />
                  <h3 className="text-lg font-bold">System Evolution Graph</h3>
                  <span className="ml-auto text-xs px-2 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/20">UNIQUE</span>
                </div>
                <p className="text-sm text-gray-400 mb-4">Track how the AI system improves its own efficiency over time through meta-agent optimization cycles.</p>
                <ResponsiveContainer width="100%" height={100}>
                  <AreaChart data={evolutionData}>
                    <defs>
                      <linearGradient id="evg" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#818cf8" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#818cf8" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <Tooltip contentStyle={{ backgroundColor: '#0a0f1e', border: '1px solid #3730a3', borderRadius: '8px', color: '#fff', fontSize: 11 }} formatter={(v) => [`${v}%`, "Efficiency"]} />
                    <Area type="monotone" dataKey="eff" stroke="#818cf8" strokeWidth={2} fill="url(#evg)" dot={{ r: 3, fill: '#818cf8' }} />
                  </AreaChart>
                </ResponsiveContainer>
                <div className="flex justify-between text-xs text-gray-600 mt-1">
                  {evolutionData.map(d => <span key={d.d}>{d.d}</span>)}
                </div>
              </motion.div>
            </RevealSection>
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ──────────────────────────────────────────────────── */}
      <section id="how-it-works" className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <RevealSection className="text-center mb-16">
            <p className="text-indigo-400 text-sm font-semibold uppercase tracking-widest mb-3">Architecture</p>
            <h2 className="text-4xl md:text-5xl font-bold mb-4">Multi-Agent Intelligence Pipeline</h2>
            <p className="text-gray-400 max-w-xl mx-auto">Four specialized agents working in sequence, continuously evaluated by a self-improving meta layer.</p>
          </RevealSection>

          {/* Core agents */}
          <div className="relative mb-16">
            <div className="hidden md:block absolute top-1/2 left-0 right-0 h-px bg-gradient-to-r from-transparent via-indigo-500/30 to-transparent -translate-y-1/2 pointer-events-none" />
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {AGENTS.map((a, i) => (
                <RevealSection key={i} delay={i * 0.15}>
                  <motion.div whileHover={{ scale: 1.04 }}
                    className="relative rounded-2xl border border-indigo-500/20 bg-[#0a0f1e]/80 p-6 text-center">
                    <div className="w-12 h-12 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 font-mono text-sm font-bold flex items-center justify-center mx-auto mb-4">
                      {a.num}
                    </div>
                    <h3 className="font-bold text-white mb-2 text-sm">{a.name}</h3>
                    <p className="text-xs text-gray-500">{a.desc}</p>
                    {i < 3 && (
                      <motion.div animate={{ x: [0, 6, 0] }} transition={{ repeat: Infinity, duration: 1.5, delay: i * 0.3 }}
                        className="hidden md:block absolute -right-3 top-1/2 -translate-y-1/2 text-indigo-500 z-10 text-lg">›</motion.div>
                    )}
                  </motion.div>
                </RevealSection>
              ))}
            </div>
          </div>

          {/* Meta layer */}
          <RevealSection delay={0.4}>
            <div className="rounded-2xl border border-purple-500/30 bg-gradient-to-br from-purple-900/20 to-indigo-900/10 p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center">
                  <FaBrain className="text-purple-400 text-sm" />
                </div>
                <div>
                  <h3 className="font-bold text-purple-300">Meta-Agent Layer</h3>
                  <p className="text-xs text-gray-500">Self-optimization & continuous improvement — Admin only</p>
                </div>
                <span className="ml-auto text-xs px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">LAYER 2</span>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {META_AGENTS.map((m, i) => (
                  <motion.div key={i} whileHover={{ scale: 1.05 }}
                    className="flex flex-col items-center gap-2 rounded-xl border border-purple-500/20 bg-purple-500/5 p-4 text-center cursor-default">
                    <div className="text-purple-400 text-lg">{m.icon}</div>
                    <span className="text-xs text-gray-300 font-medium">{m.name}</span>
                  </motion.div>
                ))}
              </div>
            </div>
          </RevealSection>
        </div>
      </section>

      {/* ── ROLE DASHBOARDS ───────────────────────────────────────────────── */}
      <section className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <RevealSection className="text-center mb-12">
            <p className="text-indigo-400 text-sm font-semibold uppercase tracking-widest mb-3">Role-Based Access</p>
            <h2 className="text-4xl md:text-5xl font-bold mb-4">Every Role Gets Their View</h2>
            <p className="text-gray-400 max-w-xl mx-auto">From full system control to simplified insight dashboards — tailored interfaces for every team member.</p>
          </RevealSection>

          <RevealSection delay={0.2}>
            <div className="rounded-2xl border border-white/10 bg-[#0a0f1e]/80 overflow-hidden">
              <div className="flex border-b border-white/5">
                {[
                  { id: "admin", label: "Admin", icon: <FaUserSecret className="text-purple-400" /> },
                  { id: "analyst", label: "Analyst", icon: <FaUserTie className="text-blue-400" /> },
                  { id: "viewer", label: "Viewer", icon: <FaEye className="text-gray-400" /> },
                ].map(tab => (
                  <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-6 py-4 text-sm font-medium transition-colors ${activeTab === tab.id ? "text-white bg-white/5 border-b-2 border-indigo-400" : "text-gray-500 hover:text-gray-300"}`}>
                    {tab.icon}{tab.label}
                  </button>
                ))}
              </div>
              <div className="p-8">
                <AnimatePresence mode="wait">
                  {activeTab === "admin" && (
                    <motion.div key="admin" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                      className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {["User Management", "Agent Configurations", "Meta Insights", "Strategy DB", "Prompt Optimizer", "Investigation History", "Performance Scores", "System Health"].map((item, i) => (
                        <div key={i} className="rounded-xl border border-purple-500/20 bg-purple-500/5 p-4 text-sm text-gray-300 font-medium">
                          <div className="w-2 h-2 rounded-full bg-purple-400 mb-2" />{item}
                        </div>
                      ))}
                    </motion.div>
                  )}
                  {activeTab === "analyst" && (
                    <motion.div key="analyst" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                      className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {["Analysis Panel", "Trend Charts", "AI Timeline", "Critical Incidents", "Execution Results", "Deep Analytics", "Agent Pipeline", "Activity Stream"].map((item, i) => (
                        <div key={i} className="rounded-xl border border-blue-500/20 bg-blue-500/5 p-4 text-sm text-gray-300 font-medium">
                          <div className="w-2 h-2 rounded-full bg-blue-400 mb-2" />{item}
                        </div>
                      ))}
                    </motion.div>
                  )}
                  {activeTab === "viewer" && (
                    <motion.div key="viewer" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                      className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {["System Overview", "KPI Cards", "Incident Table", "Investigation History"].map((item, i) => (
                        <div key={i} className="rounded-xl border border-gray-500/20 bg-gray-500/5 p-4 text-sm text-gray-300 font-medium">
                          <div className="w-2 h-2 rounded-full bg-gray-400 mb-2" />{item}
                        </div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </RevealSection>
        </div>
      </section>

      {/* ── TESTIMONIALS ──────────────────────────────────────────────────── */}
      <section className="py-24 px-6 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-purple-950/10 to-transparent pointer-events-none" />
        <div className="max-w-6xl mx-auto">
          <RevealSection className="text-center mb-16">
            <p className="text-indigo-400 text-sm font-semibold uppercase tracking-widest mb-3">Social Proof</p>
            <h2 className="text-4xl md:text-5xl font-bold mb-4">Trusted by Engineering Leaders</h2>
          </RevealSection>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t, i) => (
              <RevealSection key={i} delay={i * 0.15}>
                <motion.div whileHover={{ y: -4 }}
                  className="rounded-2xl border border-white/5 bg-white/2 backdrop-blur-sm p-6 h-full flex flex-col">
                  <div className="flex mb-3">
                    {[...Array(t.stars)].map((_, j) => <FaStar key={j} className="text-yellow-400 text-xs" />)}
                  </div>
                  <p className="text-gray-300 text-sm leading-relaxed flex-1 mb-6">"{t.text}"</p>
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${t.color} flex items-center justify-center text-white font-bold text-sm shrink-0`}>
                      {t.initials}
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-white">{t.name}</div>
                      <div className="text-xs text-gray-500">{t.role}</div>
                    </div>
                  </div>
                </motion.div>
              </RevealSection>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRICING ───────────────────────────────────────────────────────── */}
      <section id="pricing" className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <RevealSection className="text-center mb-16">
            <p className="text-indigo-400 text-sm font-semibold uppercase tracking-widest mb-3">Pricing</p>
            <h2 className="text-4xl md:text-5xl font-bold mb-4">Simple, Transparent Pricing</h2>
            <p className="text-gray-400">Start free. Scale as you grow.</p>
          </RevealSection>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
            {PLANS.map((p, i) => (
              <RevealSection key={i} delay={i * 0.15}>
                <motion.div whileHover={{ y: p.highlight ? -4 : -2 }}
                  className={`relative rounded-2xl border p-8 h-full flex flex-col ${p.highlight
                    ? "border-indigo-500 bg-gradient-to-b from-indigo-900/30 to-purple-900/20 shadow-2xl shadow-indigo-500/20 scale-105"
                    : "border-white/10 bg-white/2"}`}>
                  {p.highlight && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 text-xs font-bold px-4 py-1 rounded-full bg-indigo-500 text-white shadow-lg shadow-indigo-500/40">
                      MOST POPULAR
                    </div>
                  )}
                  <div className="mb-6">
                    <h3 className="font-bold text-lg text-white mb-2">{p.name}</h3>
                    <div className="flex items-end gap-1">
                      <span className="text-4xl font-extrabold text-white">{p.price}</span>
                      <span className="text-gray-400 mb-1">{p.period}</span>
                    </div>
                  </div>
                  <ul className="space-y-3 mb-8 flex-1">
                    {p.features.map((f, j) => (
                      <li key={j} className="flex items-center gap-2 text-sm text-gray-300">
                        <FaCheckCircle className={p.highlight ? "text-indigo-400" : "text-gray-500"} />
                        {f}
                      </li>
                    ))}
                  </ul>
                  <button
                    onClick={() => navigate("/register")}
                    className={`w-full py-3 rounded-xl font-semibold transition-all ${p.highlight
                      ? "bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/30"
                      : "border border-white/10 hover:bg-white/5 text-gray-300"}`}>
                    {p.cta}
                  </button>
                </motion.div>
              </RevealSection>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ───────────────────────────────────────────────────────────── */}
      <section id="faq" className="py-24 px-6">
        <div className="max-w-3xl mx-auto">
          <RevealSection className="text-center mb-16">
            <p className="text-indigo-400 text-sm font-semibold uppercase tracking-widest mb-3">FAQ</p>
            <h2 className="text-4xl md:text-5xl font-bold mb-4">Common Questions</h2>
          </RevealSection>
          <div className="space-y-3">
            {FAQS.map((f, i) => (
              <RevealSection key={i} delay={i * 0.08}>
                <div className={`rounded-2xl border overflow-hidden transition-all ${openFaq === i ? "border-indigo-500/40 bg-indigo-900/10" : "border-white/5 bg-white/2"}`}>
                  <button className="w-full flex items-center justify-between p-5 text-left"
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}>
                    <span className="font-medium text-white text-sm">{f.q}</span>
                    <motion.div animate={{ rotate: openFaq === i ? 180 : 0 }} transition={{ duration: 0.25 }}
                      className="text-gray-400 shrink-0 ml-4">
                      <FaAngleDown />
                    </motion.div>
                  </button>
                  <AnimatePresence>
                    {openFaq === i && (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3 }}>
                        <div className="px-5 pb-5 text-sm text-gray-400 leading-relaxed border-t border-white/5 pt-4">{f.a}</div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </RevealSection>
            ))}
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ─────────────────────────────────────────────────────── */}
      <section className="py-24 px-6 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute w-[600px] h-[600px] bg-indigo-600/15 rounded-full blur-[100px] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
          <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 20, ease: "linear" }}
            className="absolute w-[800px] h-[800px] border border-indigo-500/5 rounded-full top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
          <motion.div animate={{ rotate: -360 }} transition={{ repeat: Infinity, duration: 30, ease: "linear" }}
            className="absolute w-[1000px] h-[1000px] border border-purple-500/5 rounded-full top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
        </div>
        <RevealSection className="max-w-3xl mx-auto text-center relative z-10">
          <h2 className="text-5xl md:text-6xl font-extrabold leading-tight mb-6">
            Stop Monitoring.<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-cyan-400">Start Automating.</span>
          </h2>
          <p className="text-gray-400 text-lg mb-10 max-w-xl mx-auto">
            Join hundreds of engineering teams that have handed control to SE-AEIS and never looked back.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
              onClick={() => navigate("/register")}
              className="bg-indigo-600 hover:bg-indigo-500 text-white px-10 py-4 rounded-xl font-bold shadow-2xl shadow-indigo-500/40 text-lg">
              Start Free Trial
            </motion.button>
            <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
              onClick={() => navigate("/login")}
              className="border border-white/10 hover:bg-white/5 text-gray-300 px-10 py-4 rounded-xl font-semibold text-lg">
              Schedule Demo
            </motion.button>
          </div>
        </RevealSection>
      </section>

      {/* ── FOOTER ────────────────────────────────────────────────────────── */}
      <footer className="border-t border-white/5 py-12 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-10">
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                  <FaBrain className="text-white text-xs" />
                </div>
                <span className="font-bold text-white">SE<span className="text-indigo-400">-AEIS</span></span>
              </div>
              <p className="text-xs text-gray-500 leading-relaxed max-w-xs">Self-Evolving Autonomous Enterprise Intelligence System. The future of enterprise operations.</p>
              <div className="flex gap-3 mt-4">
                {[FaTwitter, FaLinkedin, FaGithub].map((Icon, i) => (
                  <a key={i} href="#" className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-gray-400 hover:text-white transition">
                    <Icon className="text-sm" />
                  </a>
                ))}
              </div>
            </div>
            {[
              { title: "Product", links: ["Features", "Architecture", "Pricing", "Changelog"] },
              { title: "Developers", links: ["Documentation", "API Reference", "SDKs", "Status"] },
              { title: "Company", links: ["About", "Blog", "Careers", "Contact"] },
            ].map((col, i) => (
              <div key={i}>
                <h4 className="text-xs font-semibold text-gray-300 uppercase tracking-wider mb-4">{col.title}</h4>
                <ul className="space-y-2">
                  {col.links.map((link, j) => (
                    <li key={j}><a href="#" className="text-sm text-gray-500 hover:text-gray-300 transition">{link}</a></li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="border-t border-white/5 pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-xs text-gray-600">© 2026 SE-AEIS. All rights reserved.</p>
            <div className="flex gap-6 text-xs text-gray-600">
              <a href="#" className="hover:text-gray-400 transition">Privacy Policy</a>
              <a href="#" className="hover:text-gray-400 transition">Terms of Service</a>
              <a href="#" className="hover:text-gray-400 transition">Security</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}