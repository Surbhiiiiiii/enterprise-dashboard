import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { FaExclamationTriangle, FaSearch, FaStethoscope, FaTools, FaLightbulb } from "react-icons/fa";
import { motion } from "framer-motion";

const SEVERITY_COLOR = {
  high: "text-red-400 bg-red-500/10 border-red-500/30",
  medium: "text-orange-400 bg-orange-500/10 border-orange-500/30",
  low: "text-green-400 bg-green-500/10 border-green-500/30",
};

function AnalyticsPanel({ insights, trends }) {
  const data = trends?.distribution || [];
  const { major_issue, root_cause, severity, recommended_action, insights: insightsList } = insights || {};
  const sevKey = String(severity || "").toLowerCase();
  const sevStyle = SEVERITY_COLOR[sevKey] || "text-gray-400 bg-gray-500/10 border-gray-700/30";

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Structured Insights Column */}
      <div className="bg-[#111827] border border-blue-500/20 rounded-2xl p-6 flex flex-col gap-3">
        <h3 className="text-blue-400 font-semibold mb-1">Detailed Analysis</h3>

        {major_issue ? (
          <>
            <div className="bg-dark-bg p-4 rounded-xl border border-dark-border">
              <div className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-1.5 flex items-center gap-2">
                <FaExclamationTriangle className="text-yellow-500"/> Detected Issue
              </div>
              <div className="text-sm text-gray-200">{major_issue}</div>
            </div>

            <div className="bg-dark-bg p-4 rounded-xl border border-dark-border">
              <div className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-1.5 flex items-center gap-2">
                <FaSearch className="text-purple-400"/> Root Cause
              </div>
              <div className="text-sm text-gray-200">{root_cause}</div>
            </div>

            <div className="bg-dark-bg p-4 rounded-xl border border-dark-border flex items-center gap-3">
              <div className="flex-1">
                <div className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-1.5 flex items-center gap-2">
                  <FaStethoscope className="text-red-400"/> Severity
                </div>
                <span className={`inline-block text-sm font-bold px-3 py-1 rounded-full border ${sevStyle} uppercase`}>
                  {severity || "Unknown"}
                </span>
              </div>
            </div>

            <div className="bg-dark-bg p-4 rounded-xl border border-dark-border">
              <div className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-1.5 flex items-center gap-2">
                <FaTools className="text-green-400"/> Recommended Action
              </div>
              <div className="text-sm text-gray-200">{recommended_action}</div>
            </div>

            {/* Insights list */}
            {Array.isArray(insightsList) && insightsList.length > 0 && (
              <div className="bg-dark-bg p-4 rounded-xl border border-blue-500/20">
                <div className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-2 flex items-center gap-2">
                  <FaLightbulb className="text-cyan-400"/> AI Insights
                </div>
                <ul className="space-y-2">
                  {insightsList.map((insight, i) => (
                    <motion.li
                      key={i}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.08 }}
                      className="flex items-start gap-2 text-sm text-gray-300"
                    >
                      <span className="flex-shrink-0 w-5 h-5 rounded-full bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 text-xs font-bold mt-0.5">
                        {i + 1}
                      </span>
                      {insight}
                    </motion.li>
                  ))}
                </ul>
              </div>
            )}
          </>
        ) : (
          <div className="text-gray-500 text-sm italic flex items-center gap-2 py-4">
            <div className="w-2 h-2 rounded-full bg-gray-600 animate-pulse" />
            Analysis pending — run an investigation to see insights.
          </div>
        )}
      </div>

      {/* Chart Column */}
      <div className="bg-[#111827] border border-blue-500/20 rounded-2xl p-6">
        <h3 className="text-blue-400 mb-4 font-semibold">Incident Analytics</h3>
        {data.length > 0 ? (
          <ResponsiveContainer width="100%" height={360}>
            <BarChart data={data}>
              <XAxis dataKey="issue" stroke="#6b7280" tick={{ fontSize: 11 }} />
              <YAxis stroke="#6b7280" tick={{ fontSize: 11 }} />
              <Tooltip
                contentStyle={{ backgroundColor: "#1f2937", border: "none", borderRadius: "8px", color: "#fff" }}
                cursor={{ fill: "rgba(59,130,246,0.1)" }}
              />
              <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex flex-col items-center justify-center h-72 text-gray-600">
            <svg className="w-12 h-12 mb-3 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <p className="text-sm">No analytics data yet</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default AnalyticsPanel;