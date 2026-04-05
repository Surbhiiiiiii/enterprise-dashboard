import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaFlag, FaBrain, FaSearch, FaBolt, FaShieldAlt } from 'react-icons/fa';

export default function AiActivityTimeline({ result, liveStatus }) {
  // Define the core pipeline steps in sequential order
  const baseSteps = [
    { key: 'init', title: 'Investigation Initiated', agent: 'System', icon: <FaFlag className="text-white" />, color: 'bg-blue-600' },
    { key: 'planner', title: 'Strategy Formulation', agent: 'Planner Agent', icon: <FaBrain className="text-white" />, color: 'bg-purple-600' },
    { key: 'analyst', title: 'Data Analysis & Findings', agent: 'Analyst Agent', icon: <FaSearch className="text-white" />, color: 'bg-cyan-600' },
    { key: 'executor', title: 'Automated Response Execution', agent: 'Executor Agent', icon: <FaBolt className="text-white" />, color: 'bg-yellow-600' },
    { key: 'critic', title: 'Action Evaluation', agent: 'Critic Agent', icon: <FaShieldAlt className="text-white" />, color: 'bg-green-600' }
  ];

  // Helper to determine the "completed" vs "running" vs "pending" state of each step
  const getStepStatus = (key) => {
    if (key === 'init') return (liveStatus?.planner !== 'idle' || result) ? 'completed' : 'pending';
    if (result) return 'completed'; // Everything is done if we have the final result
    if (!liveStatus) return 'pending';
    
    if (liveStatus[key] === 'completed') return 'completed';
    if (liveStatus[key] === 'running') return 'running';
    return 'pending';
  };

  // Helper to extract the actual decisions from the final result payload
  const getStepDecisionContent = (key) => {
    if (!result) return null;
    
    switch (key) {
      case 'init':
        return result.plan?.goal ? (
          <div className="text-sm text-gray-300 mt-2 bg-black/20 p-2 rounded border border-gray-700">
            <span className="font-semibold text-gray-400 block mb-1">Goal:</span> 
            {result.plan.goal}
          </div>
        ) : null;
      case 'planner':
        return result.plan?.tasks?.length > 0 ? (
          <div className="mt-2 bg-black/20 p-2 rounded border border-gray-700">
             <span className="font-semibold text-gray-400 text-xs block mb-1">Generated Plan:</span> 
             <ul className="list-disc list-inside text-sm text-gray-300 space-y-1">
               {result.plan.tasks.map((t, idx) => <li key={idx} className="truncate">{t}</li>)}
             </ul>
          </div>
        ) : null;
      case 'analyst': {
        const analysis = result.analysis?.analysis_data;
        return analysis ? (
          <div className="mt-2 bg-black/20 p-3 rounded border border-gray-700 space-y-2 text-sm">
            <p><span className="font-semibold text-ai-cyan">Issue:</span> <span className="text-gray-200">{analysis.major_issue}</span></p>
            <p><span className="font-semibold text-orange-400">Root Cause:</span> <span className="text-gray-200">{analysis.root_cause}</span></p>
            <span className={`inline-block px-2 py-1 mt-1 text-xs font-bold rounded ${analysis.severity?.toLowerCase() === 'high' ? 'bg-red-500/20 text-red-400' : 'bg-blue-500/20 text-blue-400'}`}>
              Severity: {analysis.severity}
            </span>
          </div>
        ) : null;
      }
      case 'executor':
        return result.action ? (
          <div className="mt-2 bg-black/20 p-2 rounded border border-gray-700 text-sm text-gray-300">
             <span className="font-semibold text-gray-400 text-xs block mb-1">Executed Action:</span> 
            {typeof result.action === 'object' ? JSON.stringify(result.action) : result.action.toString()}
          </div>
        ) : null;
      case 'critic':
        return result.evaluation ? (
          <div className="mt-2 bg-black/20 p-3 rounded border border-gray-700 text-sm space-y-2">
            <p><span className="font-semibold text-gray-400">Quality:</span> <span className={result.evaluation.quality === 'Good' ? 'text-green-400' : 'text-yellow-400'}>{result.evaluation.quality}</span></p>
            <p><span className="font-semibold text-gray-400">Feedback:</span> <span className="text-gray-300">{result.evaluation.feedback || result.evaluation.reasoning}</span></p>
          </div>
        ) : null;
      default: return null;
    }
  };

  // Only render active or completed steps if it's running, or all if finished
  const visibleSteps = baseSteps.filter(step => getStepStatus(step.key) !== 'pending');

  if (visibleSteps.length === 0) {
    return (
      <div className="flex items-center justify-center py-10 text-gray-500 text-sm italic">
        Awaiting investigation to visualize agent decisions...
      </div>
    );
  }

  return (
    <div className="relative pl-6 sm:pl-8 py-2 before:absolute before:inset-0 before:left-6 sm:before:left-8 before:-translate-x-[15px] before:h-full before:w-0.5 before:bg-gradient-to-b before:from-blue-500 before:via-cyan-500 before:to-transparent">
      <AnimatePresence>
        {visibleSteps.map((step, index) => {
          const status = getStepStatus(step.key);
          const isRunning = status === 'running';

          return (
            <motion.div
               key={step.key}
               initial={{ opacity: 0, x: -20 }}
               animate={{ opacity: 1, x: 0 }}
               transition={{ duration: 0.4 }}
               className="relative flex items-start gap-4 sm:gap-6 mb-8 last:mb-0 group"
            >
              {/* Central Line Dot */}
              <div className={`absolute left-0 -translate-x-1/2 flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-full shadow-lg z-10 border-4 border-dark-bg transition-transform duration-500
                ${isRunning ? 'bg-gray-700 animate-pulse' : step.color} 
                ${!isRunning ? 'group-hover:scale-110 group-hover:shadow-[0_0_15px_inherit]' : ''}
              `}>
                {status === 'completed' ? step.icon : (
                   <div className="w-3 h-3 sm:w-4 sm:h-4 rounded-full border-2 border-white border-t-transparent animate-spin"></div>
                )}
              </div>

              {/* Content Card */}
              <div className={`flex-1 glass-panel p-4 sm:p-5 transition-all duration-300 ${isRunning ? 'border-ai-cyan/50 shadow-[0_0_15px_rgba(6,182,212,0.15)]' : 'hover:border-gray-500'}`}>
                <div className="flex justify-between items-center mb-2">
                  <h4 className={`font-semibold sm:text-lg ${isRunning ? 'text-ai-cyan animate-pulse' : 'text-white'}`}>
                    {step.title}
                  </h4>
                  <span className={`text-[10px] sm:text-xs px-2 py-1 rounded tracking-wider uppercase font-bold text-white
                    ${isRunning ? 'bg-ai-cyan/20 border border-ai-cyan/30' : 'bg-gray-800 border border-gray-600'}
                  `}>
                    {step.agent}
                  </span>
                </div>
                
                {/* Real-time thinking placeholder or actual decision */}
                {isRunning ? (
                  <div className="text-sm text-gray-400 italic flex items-center gap-2 mt-3">
                    <span className="flex gap-1">
                      <span className="w-1.5 h-1.5 bg-ai-cyan rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                      <span className="w-1.5 h-1.5 bg-ai-cyan rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                      <span className="w-1.5 h-1.5 bg-ai-cyan rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                    </span>
                    Formulating decision...
                  </div>
                ) : (
                  getStepDecisionContent(step.key)
                )}
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
