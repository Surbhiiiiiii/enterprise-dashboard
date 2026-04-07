import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaBrain, FaChartBar, FaBolt, FaShieldAlt, FaChevronDown } from "react-icons/fa";

const ResultCard = ({ title, icon, glowColor, defaultExpanded = true, children }) => {
  const [expanded, setExpanded] = useState(defaultExpanded);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`glass-panel border-t-2 relative overflow-hidden flex flex-col`}
      style={{ borderTopColor: glowColor }}
    >
      {/* Background glow hint */}
      <div 
        className="absolute top-0 right-0 w-32 h-32 blur-3xl opacity-10 pointer-events-none -mr-16 -mt-16"
        style={{ backgroundColor: glowColor }}
      ></div>

      <button 
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between p-5 focus:outline-none transition-colors hover:bg-white/5 relative z-10"
      >
        <div className="flex items-center gap-3">
          <div 
            className="w-10 h-10 rounded-xl flex items-center justify-center text-xl shadow-lg"
            style={{ backgroundColor: `${glowColor}20`, color: glowColor, border: `1px solid ${glowColor}40` }}
          >
            {icon}
          </div>
          <h3 className="font-semibold text-lg tracking-wide text-white">{title}</h3>
        </div>
        
        <motion.div
          animate={{ rotate: expanded ? 180 : 0 }}
          transition={{ duration: 0.3 }}
          className="text-gray-400"
        >
          <FaChevronDown />
        </motion.div>
      </button>

      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="px-5 pb-5 relative z-10"
          >
            <div className="pt-2 border-t border-dark-border/50">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

const ResultPanel = ({ result }) => {
  if (!result) return null;

  const { plan, analysis, action, evaluation } = result;

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15
      }
    }
  };

  return (
    <motion.div 
      variants={container}
      initial="hidden"
      animate="show"
      className="grid grid-cols-1 md:grid-cols-2 gap-6"
    >
      {/* Planner Card */}
      {plan && (
      <ResultCard 
        title="Planner Strategy" 
        icon={<FaBrain />} 
        glowColor="#3b82f6" /* ai-blue */
      >
        <p className="text-gray-200 font-medium mb-3 text-sm">{plan.goal || "No goal provided"}</p>
        <div className="bg-dark-bg/50 rounded-lg p-3 border border-dark-border">
          <ul className="text-sm text-gray-400 space-y-2">
            {plan.tasks?.map((task, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="text-ai-blue mt-1 min-w-[12px]">•</span>
                <span>{task}</span>
              </li>
            ))}
          </ul>
        </div>
      </ResultCard>
      )}

      {/* Analyst Card */}
      {analysis && (
      <ResultCard 
        title="Analyst Reasoning" 
        icon={<FaChartBar />} 
        glowColor="#8b5cf6" /* purple */
        defaultExpanded={true}
      >
        <div className="bg-[#0a0f18] rounded-lg border border-purple-500/20 p-4 max-h-64 overflow-y-auto custom-scrollbar shadow-inner">
          <pre className="text-gray-300 font-mono text-xs whitespace-pre-wrap leading-relaxed">
            {analysis.analysis_text}
          </pre>
        </div>
      </ResultCard>
      )}

      {/* Executor Card */}
      {action && (
      <ResultCard 
        title="Executor Action" 
        icon={<FaBolt />} 
        glowColor="#ef4444" /* red */
      >
        <div className="flex flex-col h-full justify-between gap-4">
          <p className="text-gray-300 text-sm">{action.action}</p>
          
          <div className="flex items-center">
            <span className="text-xs text-gray-500 mr-2 uppercase tracking-wide font-semibold">Severity</span>
            <span className={`px-3 py-1 rounded-full text-xs font-bold border
              ${
                action.severity === "HIGH"
                  ? "bg-red-500/10 text-red-500 border-red-500/30"
                  : action.severity === "MEDIUM"
                  ? "bg-yellow-500/10 text-yellow-500 border-yellow-500/30"
                  : "bg-green-500/10 text-green-500 border-green-500/30"
              }`}
            >
              {action.severity}
            </span>
          </div>
        </div>
      </ResultCard>
      )}

      {/* Critic Card */}
      {evaluation && (
      <ResultCard 
        title="Critic Evaluation" 
        icon={<FaShieldAlt />} 
        glowColor="#06b6d4" /* ai-cyan */
      >
        <div className="flex flex-col gap-3">
          <div className="flex justify-between items-center bg-dark-bg/50 rounded-lg p-3 border border-dark-border">
            <span className="text-sm text-gray-400">Decision Score</span>
            <span className={`text-xl font-bold drop-shadow-[0_0_8px_rgba(6,182,212,0.5)] ${
              evaluation.decision_score >= 0.7 ? "text-green-400" : 
              evaluation.decision_score >= 0.5 ? "text-yellow-400" : "text-red-400"
            }`}>
              {evaluation.decision_score}
            </span>
          </div>

          <div className={`rounded-lg p-3 border ${
            evaluation.quality === "Good" 
              ? "bg-green-500/5 border-green-500/20" 
              : "bg-yellow-500/5 border-yellow-500/20"
          }`}>
            <span className="text-xs text-gray-500 block mb-1 uppercase tracking-wide font-semibold">Quality</span>
            <p className={`text-sm font-semibold ${evaluation.quality === "Good" ? "text-green-400" : "text-yellow-400"}`}>
              {evaluation.quality}
            </p>
          </div>

          {evaluation.reasoning && (
            <div className="bg-dark-bg/50 rounded-lg p-3 border border-dark-border">
              <span className="text-xs text-gray-500 block mb-1 uppercase tracking-wide font-semibold">Reasoning</span>
              <p className="text-sm text-gray-300 leading-relaxed">{evaluation.reasoning}</p>
            </div>
          )}

          {evaluation.feedback_for_planner && (
            <div className="bg-ai-blue/5 rounded-lg p-3 border border-ai-blue/20">
              <span className="text-xs text-ai-blue block mb-1 uppercase tracking-wide font-semibold">📌 Feedback for Next Run</span>
              <p className="text-sm text-gray-300 italic leading-relaxed">{evaluation.feedback_for_planner}</p>
            </div>
          )}
        </div>
      </ResultCard>
      )}

    </motion.div>
  );
};

export default ResultPanel;