import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaBrain, FaExclamationTriangle, FaBolt, FaCheckCircle, FaSearch } from "react-icons/fa";

function ActivityLog({ liveLogs }) {
  const events = liveLogs || [];

  return (
    <div className="h-full w-full flex flex-col relative overflow-hidden">
      
      {/* Background Gradient Accent */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-ai-blue/5 rounded-full blur-3xl opacity-50 pointer-events-none -mr-32 -mt-32 z-0"></div>

      <div className="relative z-10 flex-1 overflow-y-auto pr-2 custom-scrollbar">
        {events.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-500 text-sm italic">
            Waiting for AI execution pipeline...
          </div>
        ) : (
          <div className="relative pl-6 space-y-6 before:absolute before:inset-0 before:ml-2 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-dark-border before:to-transparent">
            
            <AnimatePresence>
              {events.map((evt, idx) => (
                <motion.div
                  key={evt.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, type: "spring", stiffness: 100 }}
                  className="relative flex items-start gap-4"
                >
                  {/* Timeline dot & icon */}
                  <div className="absolute left-0 -translate-x-[25px] flex items-center justify-center w-8 h-8 rounded-full bg-dark-bg border border-dark-border shadow-[0_0_10px_rgba(56,189,248,0.1)] z-10">
                    <span className="text-sm">
                        {evt.type === "info" && <FaSearch className="text-gray-400" />}
                        {evt.type === "success" && <FaCheckCircle className="text-ai-cyan" />}
                        {evt.type === "warning" && <FaExclamationTriangle className="text-yellow-500" />}
                        {evt.type === "error" && <FaBolt className="text-red-500" />}
                    </span>
                  </div>

                  {/* Log Card */}
                  <div className="flex-1 glass-panel px-4 py-3 group hover:border-ai-cyan/30 transition-colors duration-300">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                         <span className={`font-mono text-xs px-2 py-0.5 rounded uppercase tracking-wider
                           ${evt.type === 'info' ? 'bg-gray-800 text-gray-400' : ''}
                           ${evt.type === 'success' ? 'bg-ai-cyan/10 text-ai-cyan' : ''}
                           ${evt.type === 'warning' ? 'bg-yellow-500/10 text-yellow-500' : ''}
                           ${evt.type === 'error' ? 'bg-red-500/10 text-red-500' : ''}
                         `}>
                           {evt.agent}
                         </span>
                      </div>
                      <span className="text-[10px] text-gray-500 font-mono hidden sm:block">
                        {evt.time}
                      </span>
                    </div>
                    
                    <p className="text-sm text-gray-300 leading-relaxed font-light">
                      {evt.message}
                    </p>
                    <span className="text-[10px] text-gray-500 font-mono block sm:hidden mt-2">
                        {evt.time}
                    </span>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            
          </div>
        )}
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(11, 19, 36, 0.5);
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(56, 189, 248, 0.2);
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(56, 189, 248, 0.4);
        }
      `}</style>

    </div>
  );
}

export default ActivityLog;