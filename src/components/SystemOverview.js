import React from "react";
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from "recharts";

const COLORS = ['#3b82f6', '#f59e0b', '#ef4444', '#10b981'];

export default function SystemOverview({ result }) {
  if (!result) return <div className="p-6 text-gray-400 flex justify-center items-center h-64"><span className="animate-pulse">Loading System Intelligence...</span></div>;

  const trendData = result.trends?.chart || [];
  const deptData = result.trends?.distribution || [];
  
  // Create severity distribution from incidents
  const severityCount = { LOW: 0, MEDIUM: 0, HIGH: 0 };
  (result.incidents || []).forEach(inc => {
    const p = inc.priority?.toUpperCase();
    if (severityCount[p] !== undefined) {
      severityCount[p]++;
    }
  });
  const severityData = [
    { name: 'Low', value: severityCount.LOW },
    { name: 'Medium', value: severityCount.MEDIUM },
    { name: 'High', value: severityCount.HIGH }
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
        <svg className="w-6 h-6 text-ai-cyan" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
        System Intelligence Overview
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Incident Trends - Line Chart */}
        <div className="glass-panel p-4 h-80">
          <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">Incident Trends</h3>
          <ResponsiveContainer width="100%" height="80%">
            <LineChart data={trendData}>
              <XAxis dataKey="day" stroke="#9ca3af" fontSize={12} />
              <YAxis stroke="#9ca3af" fontSize={12} />
              <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px', color: '#fff' }} />
              <Line type="monotone" dataKey="complaints" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4, fill: '#3b82f6' }} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Department Impact - Bar Chart */}
        <div className="glass-panel p-4 h-80">
          <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">Department Impact</h3>
          <ResponsiveContainer width="100%" height="80%">
            <BarChart data={deptData}>
              <XAxis dataKey="issue" stroke="#9ca3af" fontSize={12} tickFormatter={(val) => val.length > 12 ? val.substring(0,12)+'...' : val} />
              <YAxis stroke="#9ca3af" fontSize={12} />
              <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px', color: '#fff' }} />
              <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]}>
                {deptData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Severity Distribution - Pie Chart */}
        <div className="glass-panel p-4 h-80">
          <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">Severity Distribution</h3>
          <ResponsiveContainer width="100%" height="80%">
            <PieChart>
              <Pie data={severityData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value" stroke="none">
                {severityData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px', color: '#fff' }} itemStyle={{ color: '#fff' }} />
              <Legend verticalAlign="bottom" height={36} wrapperStyle={{ fontSize: '12px', color: '#9ca3af' }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Tables Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-panel p-4 h-auto overflow-hidden flex flex-col">
          <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4 flex-shrink-0">Recent Incidents</h3>
          <div className="overflow-auto flex-1 custom-scrollbar">
            <table className="w-full text-sm text-left text-gray-300">
              <thead className="text-xs text-gray-400 uppercase bg-[#1f2937] sticky top-0">
                <tr>
                  <th className="px-4 py-3 rounded-tl-lg">ID</th>
                  <th className="px-4 py-3">Issue</th>
                  <th className="px-4 py-3 rounded-tr-lg">Severity</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {(result.incidents || []).map((inc, i) => (
                  <tr key={i} className="hover:bg-white/5 transition-colors">
                    <td className="px-4 py-3 font-medium text-white">{inc.id}</td>
                    <td className="px-4 py-3 truncate max-w-[200px]">{inc.issue}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded text-xs tracking-wider font-bold ${inc.priority === 'HIGH' ? 'bg-red-500/20 text-red-400' : inc.priority === 'MEDIUM' ? 'bg-orange-500/20 text-orange-400' : 'bg-green-500/20 text-green-400'}`}>
                        {inc.priority}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {(!result.incidents || result.incidents.length === 0) && (
              <p className="text-gray-500 text-sm italic text-center py-4">No recent incidents found.</p>
            )}
          </div>
        </div>

        <div className="glass-panel p-4 h-auto overflow-hidden flex flex-col">
          <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4 flex-shrink-0">Recent AI Investigations</h3>
          <div className="space-y-4 overflow-auto flex-1 custom-scrollbar pr-2">
            {(result.history || []).map((hist, i) => (
              <div key={i} className="border-l-2 border-ai-cyan bg-[#1f2937]/30 p-3 hover:bg-[#1f2937]/60 rounded-r-lg transition-colors group">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="text-white text-sm font-medium group-hover:text-ai-cyan transition-colors" title={hist.goal}>{hist.goal}</h4>
                  <span className="text-xs text-gray-500 whitespace-nowrap ml-4">{new Date(hist.timestamp).toLocaleDateString()}</span>
                </div>
                <div className="bg-black/20 rounded p-2 mb-2">
                  <p className="text-xs text-gray-300"><span className="text-ai-cyan font-semibold">Detected:</span> {hist.detected_issue}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${hist.severity === 'High' || hist.severity === 'HIGH' ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'}`}>
                    {hist.severity || 'Unknown'}
                  </span>
                  <p className="text-xs text-gray-400 truncate"><span className="text-gray-500">Root Cause:</span> {hist.root_cause}</p>
                </div>
              </div>
            ))}
            {(!result.history || result.history.length === 0) && (
              <p className="text-gray-500 text-sm italic text-center py-8">No recent investigations found.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
