import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { FaBrain, FaBolt, FaHistory, FaCheckCircle, FaChartBar } from "react-icons/fa";

function MetaInsightsPanel({ metaInsights }) {
  if (!metaInsights) {
    return (
      <div className="h-full flex items-center justify-center text-gray-500">
        Waiting for system execution to generate meta-insights...
      </div>
    );
  }

  const { performance, prompts_optimized, strategy_updated } = metaInsights;

  return (
    <div className="h-full flex flex-col gap-6">
      
      {/* Performance Scores */}
      <div className="bg-dark-bg/50 rounded-xl p-4 border border-dark-border">
        <h4 className="flex items-center gap-2 text-sm font-semibold text-gray-300 mb-4">
          <FaChartBar className="text-purple-400" /> Session Performance
        </h4>
        <div className="space-y-3">
          {Object.entries({
            "Accuracy": performance?.accuracy || 0,
            "Usefulness": performance?.usefulness || 0,
            "Timeliness": performance?.timeliness || 0
          }).map(([key, value]) => (
            <div key={key}>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-gray-400">{key}</span>
                <span className="text-purple-300">{(value * 100).toFixed(0)}%</span>
              </div>
              <div className="w-full bg-dark-bg rounded-full h-1.5 overflow-hidden">
                <motion.div 
                  className="bg-purple-500 h-1.5 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${value * 100}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                />
              </div>
            </div>
          ))}
        </div>
        <p className="text-xs text-gray-400 mt-4 italic border-t border-dark-border pt-3">
          "{performance?.summary || "Analysis successful."}"
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Strategy Optimization */}
        <div className={`rounded-xl p-4 border transition-colors ${strategy_updated ? 'bg-indigo-900/20 border-indigo-500/30' : 'bg-dark-bg/50 border-dark-border'}`}>
          <div className="flex items-center gap-2 mb-2">
            <FaBrain className={strategy_updated ? "text-indigo-400" : "text-gray-500"} />
            <span className="text-sm font-medium text-gray-300">Strategy DB</span>
          </div>
          <p className="text-xs text-gray-400 flex items-center gap-2">
            {strategy_updated ? (
              <><FaCheckCircle className="text-green-500"/> Blueprint updated</>
            ) : "No changes required"}
          </p>
        </div>

        {/* Prompt Optimization */}
        <div className={`rounded-xl p-4 border transition-colors ${prompts_optimized ? 'bg-fuchsia-900/20 border-fuchsia-500/30' : 'bg-dark-bg/50 border-dark-border'}`}>
          <div className="flex items-center gap-2 mb-2">
            <FaBolt className={prompts_optimized ? "text-fuchsia-400" : "text-gray-500"} />
            <span className="text-sm font-medium text-gray-300">Agent Prompts</span>
          </div>
          <p className="text-xs text-gray-400 flex items-center gap-2">
            {prompts_optimized ? (
              <><FaCheckCircle className="text-green-500"/> Prompts refined</>
            ) : "Current prompts optimal"}
          </p>
        </div>
      </div>
      
    </div>
  );
}

export default MetaInsightsPanel;
