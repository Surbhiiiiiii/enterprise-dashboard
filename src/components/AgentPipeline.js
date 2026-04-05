import { useState, useEffect } from "react";
import { FaBrain, FaChartBar, FaBolt, FaShieldAlt } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";

function AgentPipeline({ result, liveStatus }) {
  
  // Track active index based on logic
  const [activeIndex, setActiveIndex] = useState(-1);

  useEffect(() => {
    if (!liveStatus) return;
    
    // Determine active index based on what is not idle
    let nextIndex = -1;
    if (liveStatus.planner !== "idle") nextIndex = 0;
    if (liveStatus.analyst !== "idle") nextIndex = 1;
    if (liveStatus.executor !== "idle") nextIndex = 2;
    if (liveStatus.critic !== "idle") nextIndex = 3;
    if (liveStatus.critic === "completed") nextIndex = 4;
    
    setActiveIndex(nextIndex);
  }, [liveStatus]);

  const agents = [
    { key: "planner", name: "Planner", icon: <FaBrain /> },
    { key: "analyst", name: "Analyst", icon: <FaChartBar /> },
    { key: "executor", name: "Executor", icon: <FaBolt /> },
    { key: "critic", name: "Critic", icon: <FaShieldAlt /> }
  ];

  const metaAgents = [
    { key: "performance", name: "Performance", icon: <FaChartBar /> },
    { key: "strategy", name: "Strategy", icon: <FaBrain /> },
    { key: "prompt", name: "Prompt", icon: <FaBolt /> },
    { key: "memory", name: "Memory", icon: <FaShieldAlt /> }
  ];

  // We consider meta active if critic is completed
  const isMetaActive = liveStatus && liveStatus.critic === "completed";


  return (
    <div className="w-full py-8 overflow-hidden relative">
      
      {/* Background connecting lines wrapper */}
      <div className="absolute top-1/2 left-0 w-full h-1 -translate-y-1/2 bg-dark-border z-0 flex rounded-full overflow-hidden px-[10%]">
         {/* Animated filling line segment */}
         <motion.div 
            className="h-full bg-gradient-to-r from-ai-cyan to-ai-blue shadow-[0_0_15px_rgba(6,182,212,0.8)] rounded-full"
            initial={{ width: "0%" }}
            animate={{ width: activeIndex >= 0 ? `${(activeIndex / (agents.length - 1)) * 100}%` : "0%" }}
            transition={{ duration: 1, ease: "easeInOut" }}
         />
      </div>

      <div className="flex justify-between relative z-10 w-full px-[5%] sm:px-[10%]">
        {agents.map((agent, i) => {
          const state = (liveStatus && liveStatus[agent.key]) || "idle";
          
          // Determine styles based on state
          const isRunning = state === "running";
          const isCompleted = state === "completed";
          const isIdle = state === "idle";

          return (
            <motion.div
              key={agent.key}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="flex flex-col items-center gap-3 relative"
            >
              <motion.div
                whileHover={{ scale: 1.05 }}
                className={`
                  w-20 h-20 rounded-2xl flex items-center justify-center text-3xl transition-all duration-500 relative z-10
                  ${isIdle ? "bg-dark-surface border border-dark-border/50 text-gray-500" : ""}
                  ${isRunning ? "bg-dark-bg border border-ai-cyan text-ai-cyan shadow-[0_0_25px_rgba(6,182,212,0.4)]" : ""}
                  ${isCompleted ? "bg-gradient-to-br from-ai-blue/80 to-ai-cyan/80 border border-ai-cyan/50 text-white shadow-[0_0_15px_rgba(56,189,248,0.2)]" : ""}
                `}
              >
                {/* Glow behind the icon if running */}
                {isRunning && (
                  <motion.div 
                    className="absolute inset-0 rounded-2xl bg-ai-cyan/20 blur-md"
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                )}
                
                <span className="relative z-10">{agent.icon}</span>

                {/* Processing spinner indicator */}
                <AnimatePresence>
                  {isRunning && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="absolute -top-1 -right-1 w-4 h-4"
                    >
                      <span className="absolute inline-flex h-full w-full rounded-full bg-ai-cyan opacity-75 animate-ping"></span>
                      <span className="relative inline-flex rounded-full w-4 h-4 bg-ai-cyan"></span>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Success checkmark */}
                <AnimatePresence>
                  {isCompleted && (
                    <motion.div
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="absolute -top-2 -right-2 bg-green-500 text-white rounded-full p-1 shadow-lg"
                    >
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>

              <div className="text-center">
                <h4 className={`font-semibold tracking-wide transition-colors duration-300
                  ${isIdle ? "text-gray-500" : isRunning ? "text-ai-cyan" : "text-white"}
                `}>
                  {agent.name}
                </h4>
                <p className={`text-xs mt-1 transition-colors duration-300 capitalize
                  ${isIdle ? "text-gray-600" : isRunning ? "text-ai-cyan" : "text-gray-400"}
                `}>
                  {state}
                </p>
              </div>

            </motion.div>
          );
        })}
      </div>

      {/* Meta-Intelligence Layer Pipeline */}
      <div className="mt-12 pt-8 border-t border-dark-border/50">
        <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-6 text-center">Meta-Intelligence Layer</h3>
        <div className="flex justify-between relative z-10 w-full px-[5%] sm:px-[10%]">
          {metaAgents.map((agent, i) => {
            // Simplified logic for meta-agents: light up after main pipeline finishes
            const state = isMetaActive ? "completed" : "idle";
            const isCompleted = state === "completed";
            const isIdle = state === "idle";

            return (
              <motion.div
                key={agent.key}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="flex flex-col items-center gap-3 relative"
              >
                <div
                  className={`
                    w-16 h-16 rounded-2xl flex items-center justify-center text-2xl transition-all duration-500 relative z-10
                    ${isIdle ? "bg-dark-surface border border-dark-border/50 text-gray-600" : ""}
                    ${isCompleted ? "bg-gradient-to-br from-indigo-900/60 to-purple-900/60 border border-purple-500/50 text-purple-400 shadow-[0_0_15px_rgba(168,85,247,0.2)]" : ""}
                  `}
                >
                  <span className="relative z-10">{agent.icon}</span>

                  <AnimatePresence>
                    {isCompleted && (
                      <motion.div
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="absolute -top-1 -right-1 bg-purple-500 text-white rounded-full p-0.5 shadow-lg"
                      >
                        <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <div className="text-center">
                  <h4 className={`text-sm font-semibold tracking-wide transition-colors duration-300
                    ${isIdle ? "text-gray-600" : "text-purple-300"}
                  `}>
                    {agent.name}
                  </h4>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default AgentPipeline;