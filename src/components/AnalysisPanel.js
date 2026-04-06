import React, { useState, useRef, useEffect } from "react";
import { apiRunAnalysis } from "../api";
import { motion, AnimatePresence } from "framer-motion";



const PHASES = [
  { label: "Planner",  icon: "🧠", color: "#38bdf8", desc: "Formulating strategy..." },
  { label: "Analyst",  icon: "🔍", color: "#a78bfa", desc: "Analysing data..." },
  { label: "Executor", icon: "⚙️", color: "#34d399", desc: "Executing actions..." },
  { label: "Critic",   icon: "✅", color: "#fb923c", desc: "Validating results..." },
];

const AnalysisPanel = ({ setResult, user, setLiveStatus, setLiveLogs }) => {
  const [goal, setGoal] = useState("");
  const [url, setUrl] = useState("");
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [, setErrorMsg] = useState("");
  const [phaseIndex, setPhaseIndex] = useState(0);
  const [dots, setDots] = useState("");
  const fileInputRef = useRef(null);
  const phaseTimer = useRef(null);
  const dotsTimer = useRef(null);

  useEffect(() => {
    if (loading) {
      setPhaseIndex(0);
      setDots("");
      phaseTimer.current = setInterval(() => setPhaseIndex(i => (i + 1) % PHASES.length), 2800);
      dotsTimer.current = setInterval(() => setDots(d => d.length >= 3 ? "" : d + "."), 400);
    } else {
      clearInterval(phaseTimer.current);
      clearInterval(dotsTimer.current);
      setPhaseIndex(0);
      setDots("");
    }
    return () => { clearInterval(phaseTimer.current); clearInterval(dotsTimer.current); };
  }, [loading]);

  const role = user?.role || "viewer";
  const canRunAI = role === "analyst" || role === "admin";

  if (!canRunAI) return null;

  const handleRun = async () => {
    setErrorMsg("");
    if (!goal.trim() && !file && !url.trim()) {
      setErrorMsg("Please provide an analysis goal, upload a dataset, or enter a URL.");
      return;
    }
    if (!goal.trim()) {
      setErrorMsg("Please provide an analysis goal describing what to investigate.");
      return;
    }

    const formData = new FormData();
    formData.append("goal", goal.trim());
    if (url.trim()) formData.append("url", url.trim());
    if (file) formData.append("file", file);

    // Timers for fallback local animation (in case WebSocket is unreliable on Render)
    const timers = [];

    const addLog = (agent, message, type = "info") => {
      if (setLiveLogs)
        setLiveLogs((prev) => [
          ...prev,
          {
            id: `evt_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
            time: new Date().toISOString().split("T")[1].slice(0, 12),
            agent,
            message,
            type,
          },
        ]);
    };

    const setPhase = (running, completed = []) => {
      if (!setLiveStatus) return;
      const s = { planner: "idle", analyst: "idle", executor: "idle", critic: "idle" };
      completed.forEach((k) => { s[k] = "completed"; });
      if (running) s[running] = "running";
      setLiveStatus(s);
    };

    try {
      setPhase("planner");
      addLog("Planner", "Building memory-informed task plan...", "info");

      timers.push(setTimeout(() => {
        setPhase("analyst", ["planner"]);
        addLog("Planner", "Plan generated.", "success");
        addLog("Analyst", "Inspecting dataset and finding patterns...", "warning");
      }, 3000));

      timers.push(setTimeout(() => {
        setPhase("executor", ["planner", "analyst"]);
        addLog("Analyst", "Analysis complete.", "success");
        addLog("Executor", "Triggering automated responses...", "error");
      }, 7000));

      timers.push(setTimeout(() => {
        setPhase("critic", ["planner", "analyst", "executor"]);
        addLog("Executor", "Actions executed.", "success");
        addLog("Critic", "Scoring decision quality...", "info");
      }, 11000));

      if (setLiveLogs) setLiveLogs([]);
      setResult(null);
      setLoading(true);

      const data = await apiRunAnalysis(formData);

      // Clear fallback timers — real response arrived
      timers.forEach(clearTimeout);

      // Mark all completed
      if (setLiveStatus)
        setLiveStatus({ planner: "completed", analyst: "completed", executor: "completed", critic: "completed" });
      addLog("Critic", "Evaluation stored. Pipeline complete.", "success");
      addLog("System", "Meta-Intelligence optimizations applied.", "success");

      setResult(data);
    } catch (err) {
      timers.forEach(clearTimeout);
      if (setLiveStatus)
        setLiveStatus({ planner: "idle", analyst: "idle", executor: "idle", critic: "idle" });
      setErrorMsg(err.message || "Analysis failed. Check backend logs.");
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (!selected) return;
    const ext = selected.name.split(".").pop().toLowerCase();
    const validExts = ["csv", "json", "txt", "pdf", "xlsx", "xls"];
    if (validExts.includes(ext)) {
      setFile(selected);
      setErrorMsg("");
    } else {
      setErrorMsg("Unsupported file type. Accepted: CSV, JSON, Excel, PDF, TXT.");
    }
  };

  const removeFile = () => {
    setFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="w-full flex flex-col gap-6 items-center">
      <div className="relative w-full sm:w-3/4 lg:w-2/3 group">
        
        {/* Neon blue gradient boundary */}
        <div className="absolute -inset-0.5 bg-gradient-to-r from-ai-cyan to-ai-blue rounded-xl blur opacity-40 group-hover:opacity-75 transition duration-500 pointer-events-none"></div>
        
        <div className="relative bg-dark-bg/95 border border-dark-border p-6 rounded-xl shadow-2xl backdrop-blur-md flex flex-col gap-4">
            
            <div className="flex items-center gap-2 mb-2 text-white font-semibold tracking-wider text-sm uppercase">
               <svg className="w-5 h-5 text-ai-cyan" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path></svg>
               Intelligence Request
            </div>

            <textarea
                placeholder="Describe the operational issue or investigation request..."
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
                rows={3}
                disabled={loading}
                className="w-full p-4 rounded-lg bg-[#141b2d] border border-gray-700/50 text-white placeholder-gray-500
                focus:border-ai-cyan focus:ring-1 focus:ring-ai-cyan outline-none transition-all duration-300 resize-none"
            />

            <input
                type="text"
                placeholder="Or paste a URL to analyze (e.g., https://example.com/report)..."
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                disabled={loading}
                className="w-full p-3 rounded-lg bg-[#141b2d] border border-gray-700/50 text-white placeholder-gray-500
                focus:border-ai-cyan focus:ring-1 focus:ring-ai-cyan outline-none transition-all duration-300"
            />
            
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                
                <div className="flex items-center gap-3">
                    <input 
                        type="file" 
                        ref={fileInputRef} 
                        onChange={handleFileChange} 
                        className="hidden" 
                        accept=".csv,.json,.txt,.pdf,text/csv,application/json,text/plain,application/pdf" 
                    />
                    
                    <button 
                        onClick={() => fileInputRef.current.click()}
                        disabled={loading}
                        className="px-4 py-2 text-sm bg-dark-surface hover:bg-[#1f2937] border border-gray-600 rounded-lg text-gray-300 transition-colors flex items-center gap-2"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path></svg>
                        Upload Dataset
                    </button>
                    
                    <AnimatePresence>
                        {file && (
                            <motion.div 
                                initial={{ opacity: 0, x: -10 }} 
                                animate={{ opacity: 1, x: 0 }} 
                                exit={{ opacity: 0 }}
                                className="flex items-center gap-2 text-xs text-ai-cyan bg-ai-cyan/10 px-3 py-1.5 rounded-full border border-ai-cyan/20"
                            >
                                <span className="truncate max-w-[150px]">{file.name}</span>
                                <button onClick={removeFile} className="hover:text-white ml-1">
                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"></path></svg>
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleRun}
                disabled={loading}
                className={`relative px-8 py-3 rounded-lg font-bold tracking-wide transition-all duration-300 overflow-hidden group
                ${loading 
                        ? "bg-dark-surface border border-ai-blue/50 text-ai-blue cursor-wait"
                        : "bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-[0_0_15px_rgba(6,182,212,0.4)] hover:shadow-[0_0_25px_rgba(6,182,212,0.6)]"
                }`}
                >
                {!loading && (
                    <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-in-out"></div>
                )}
                <span className="relative z-10 flex items-center gap-2">
                    {loading ? (
                      <AnimatePresence mode="wait">
                        <motion.span
                          key={phaseIndex}
                          initial={{ opacity: 0, y: 6 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -6 }}
                          transition={{ duration: 0.25 }}
                          className="flex items-center gap-2"
                        >
                          <span className="text-base">{PHASES[phaseIndex].icon}</span>
                          <span style={{ color: PHASES[phaseIndex].color }}>
                            {PHASES[phaseIndex].label}{dots}
                          </span>
                        </motion.span>
                      </AnimatePresence>
                    ) : (
                       <>
                         Start Investigation
                         <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                       </>
                    )}
                </span>
                </motion.button>

                {/* Live phase bar */}
                <AnimatePresence>
                {loading && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="flex items-center justify-center gap-3 pt-2"
                  >
                    {PHASES.map((p, i) => (
                      <div key={p.label} className="flex flex-col items-center gap-1">
                        <motion.div
                          animate={i === phaseIndex ? { scale: [1, 1.3, 1], opacity: 1 } : { scale: 1, opacity: 0.3 }}
                          transition={{ duration: 0.6, repeat: i === phaseIndex ? Infinity : 0 }}
                          className="text-sm"
                        >{p.icon}</motion.div>
                        <span className="text-[9px] tracking-widest uppercase"
                          style={{ color: i === phaseIndex ? p.color : "#4b5563" }}>
                          {p.label}
                        </span>
                        {i < PHASES.length - 1 && (
                          <div className="absolute" style={{ display: "none" }} />
                        )}
                      </div>
                    ))}
                  </motion.div>
                )}
                </AnimatePresence>

            </div>
        </div>
      </div>
    </div>
  );
};

export default AnalysisPanel;
