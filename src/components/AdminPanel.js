import React, { useState, useEffect } from "react";
import { FaUserShield, FaEdit, FaSave, FaServer, FaHistory, FaBrain, FaBolt, FaMicrochip } from "react-icons/fa";
import MetaInsightsPanel from "./MetaInsightsPanel";

const AdminPanel = ({ user, metaInsights }) => {
  const [activeTab, setActiveTab] = useState("users");
  
  // User state
  const [users, setUsers] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editRole, setEditRole] = useState("");

  // Memory state
  const [events, setEvents] = useState([]);
  const [strategies, setStrategies] = useState([]);
  const [prompts, setPrompts] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (activeTab === "users") loadUsers();
    else if (activeTab === "events") fetchMemory("events", setEvents);
    else if (activeTab === "strategies") fetchMemory("strategies", setStrategies);
    else if (activeTab === "prompts") fetchMemory("prompts", setPrompts);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  const getAuthHeader = () => {
    const token = sessionStorage.getItem("token") || "";
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  const loadUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch("http://localhost:8000/admin/users", {
        headers: getAuthHeader(),
      });
      if (res.ok) {
        const data = await res.json();
        setUsers(data);
      } else {
        setUsers([]);
      }
    } catch (e) {
      setUsers([]);
    }
    setLoading(false);
  };

  const handleEdit = (u) => {
    setEditingId(u.username);
    setEditRole(u.role);
  };

  const handleSave = async (username) => {
    try {
      const res = await fetch(`http://localhost:8000/admin/users/${username}/role`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", ...getAuthHeader() },
        body: JSON.stringify({ role: editRole }),
      });
      if (res.ok) {
        setUsers((prev) => prev.map((u) => u.username === username ? { ...u, role: editRole } : u));
      }
    } catch (e) {}
    setEditingId(null);
  };

  const fetchMemory = async (type, setter) => {
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:8000/admin/memory/${type}`, {
        headers: getAuthHeader(),
      });
      if (res.ok) {
        const data = await res.json();
        setter(data);
      }
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  const tabs = [
    { id: "users", label: "Users", icon: <FaUserShield /> },
    { id: "events", label: "Investigations", icon: <FaHistory /> },
    { id: "strategies", label: "Strategies", icon: <FaBrain /> },
    { id: "prompts", label: "Prompts", icon: <FaBolt /> },
    { id: "meta", label: "Meta Insights", icon: <FaMicrochip /> }
  ];

  return (
    <div className="glass-panel p-6 flex flex-col gap-6" id="admin">
      <div className="flex items-center justify-between pb-4 border-b border-dark-border">
        <h2 className="text-xl font-bold text-white flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center border border-purple-500/20 shadow-[0_0_15px_rgba(168,85,247,0.2)]">
            <FaServer />
          </div>
          Admin Dashboard
        </h2>
        <div className="flex gap-2">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === tab.id ? 'bg-purple-500 text-white' : 'bg-dark-bg text-gray-400 hover:text-white hover:bg-white/5'}`}
            >
              {tab.icon} <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="overflow-x-auto min-h-[300px]">
        {loading ? (
          <div className="flex justify-center items-center h-40 text-gray-500">Loading system data...</div>
        ) : (
          <>
            {/* USERS TAB */}
            {activeTab === "users" && (
              <table className="w-full text-left text-sm text-gray-400">
                <thead className="text-xs text-gray-500 uppercase bg-[#0B1324] border-b border-dark-border">
                  <tr>
                    <th className="px-6 py-4 font-semibold">Username</th>
                    <th className="px-6 py-4 font-semibold">Role</th>
                    <th className="px-6 py-4 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.length === 0 ? (
                    <tr><td colSpan="3" className="px-6 py-8 text-center text-gray-500 italic">No users found.</td></tr>
                  ) : users.map((u, i) => (
                    <tr key={i} className="border-b border-dark-border/50 hover:bg-white/5">
                      <td className="px-6 py-4 text-gray-200">{u.username}</td>
                      <td className="px-6 py-4">
                        {editingId === u.username ? (
                          <select
                            value={editRole}
                            onChange={(e) => setEditRole(e.target.value)}
                            className="bg-dark-bg border border-purple-500 text-white text-sm rounded-lg p-2"
                          >
                            <option value="viewer">Viewer</option>
                            <option value="analyst">Analyst</option>
                            <option value="admin">Admin</option>
                          </select>
                        ) : (
                          <span className={`px-3 py-1 rounded-full text-xs font-bold border uppercase
                            ${u.role === 'admin' ? 'bg-purple-500/10 text-purple-400 border-purple-500/30' : 
                              u.role === 'analyst' ? 'bg-ai-blue/10 text-ai-blue border-ai-blue/30' : 
                              'bg-gray-500/10 text-gray-400 border-gray-500/30'}`
                          }>{u.role || "viewer"}</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        {editingId === u.username ? (
                          <button onClick={() => handleSave(u.username)} className="text-green-400 p-2"><FaSave size={16} /></button>
                        ) : (
                          <button onClick={() => handleEdit(u)} className="text-purple-400 p-2"><FaEdit size={16} /></button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {/* EVENTS TAB */}
            {activeTab === "events" && (
              <table className="w-full text-left text-sm text-gray-400">
                <thead className="text-xs text-gray-500 uppercase bg-[#0B1324] border-b border-dark-border">
                  <tr>
                    <th className="px-6 py-4 font-semibold">Agent</th>
                    <th className="px-6 py-4 font-semibold">Action</th>
                    <th className="px-6 py-4 font-semibold">Details</th>
                  </tr>
                </thead>
                <tbody>
                  {events.length === 0 ? (
                    <tr><td colSpan="3" className="px-6 py-8 text-center text-gray-500 italic">No investigation history.</td></tr>
                  ) : events.slice().reverse().map((e, i) => (
                    <tr key={i} className="border-b border-dark-border/50 hover:bg-white/5">
                      <td className="px-6 py-4 text-purple-300 font-medium">{e.agent}</td>
                      <td className="px-6 py-4 text-gray-300">{e.action}</td>
                      <td className="px-6 py-4 font-mono text-xs overflow-hidden max-w-sm truncate">{JSON.stringify(e.details)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {/* STRATEGIES TAB */}
            {activeTab === "strategies" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {strategies.length === 0 ? (
                  <div className="col-span-2 text-center text-gray-500 py-8 italic">No optimized strategies logged yet.</div>
                ) : strategies.map((s, i) => (
                  <div key={i} className="bg-dark-bg border border-dark-border rounded-xl p-4">
                    <h4 className="text-ai-cyan font-semibold text-sm mb-2">{s.goal}</h4>
                    <pre className="text-xs text-gray-400 whitespace-pre-wrap font-mono bg-black/30 p-3 rounded-lg overflow-x-auto max-h-40">
                      {JSON.stringify(s.strategy, null, 2)}
                    </pre>
                  </div>
                ))}
              </div>
            )}

            {/* PROMPTS TAB */}
            {activeTab === "prompts" && (
              <div className="space-y-4">
                {Object.keys(prompts).length === 0 ? (
                  <div className="text-center text-gray-500 py-8 italic">No dynamically optimized prompts present. Using defaults.</div>
                ) : Object.entries(prompts).map(([agent, txt]) => (
                  <div key={agent} className="bg-dark-bg border border-purple-500/20 rounded-xl p-4">
                    <h4 className="text-purple-400 font-bold mb-2 flex items-center gap-2"><FaBolt/> {agent}</h4>
                    <p className="text-sm text-gray-300 bg-black/40 p-3 rounded border border-dark-border/50 font-mono italic">
                      {txt}
                    </p>
                  </div>
                ))}
              </div>
            )}

            {/* META INSIGHTS TAB */}
            {activeTab === "meta" && (
              <div className="p-2">
                <p className="text-xs text-gray-500 mb-4 italic">
                  Meta-intelligence data reflects the last system execution. Run an investigation to populate these insights.
                </p>
                <MetaInsightsPanel metaInsights={metaInsights} />
              </div>
            )}

          </>
        )}
      </div>
    </div>
  );
};

export default AdminPanel;
