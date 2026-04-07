import React, { useState, useEffect } from "react";
import { FaUserShield, FaEdit, FaSave, FaServer, FaHistory, FaBrain, FaBolt, FaMicrochip, FaSync, FaExclamationTriangle } from "react-icons/fa";
import MetaInsightsPanel from "./MetaInsightsPanel";
import { getAuthHeaders } from "../api";

const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:8000";

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
  const [error, setError] = useState("");

  // Live meta insights
  const [liveMeta, setLiveMeta] = useState(null);

  useEffect(() => {
    setError("");
    if (activeTab === "users") loadUsers();
    else if (activeTab === "events") fetchMemory("events", setEvents);
    else if (activeTab === "strategies") fetchMemory("strategies", setStrategies);
    else if (activeTab === "prompts") fetchMemory("prompts", setPrompts);
    else if (activeTab === "meta") fetchMetaInsights();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  // ── API helpers ────────────────────────────────────────────────────────────
  const authFetch = async (path, options = {}) => {
    const res = await fetch(`${API_BASE}${path}`, {
      ...options,
      headers: {
        ...getAuthHeaders(),          // uses shared helper from api.js — always correct
        "Content-Type": "application/json",
        ...(options.headers || {}),
      },
    });
    if (res.status === 401) {
      setError("Session expired. Please log out and log back in.");
      return null;
    }
    if (res.status === 403) {
      setError("Admin access denied. You need admin role to view this data.");
      return null;
    }
    if (!res.ok) {
      const json = await res.json().catch(() => ({}));
      setError(json.detail || `Request failed (${res.status})`);
      return null;
    }
    return res.json();
  };

  // ── Fetchers ───────────────────────────────────────────────────────────────
  const loadUsers = async () => {
    setLoading(true);
    setError("");
    const data = await authFetch("/admin/users");
    if (data !== null) setUsers(Array.isArray(data) ? data : []);
    setLoading(false);
  };

  const fetchMemory = async (type, setter) => {
    setLoading(true);
    setError("");
    const data = await authFetch(`/admin/memory/${type}`);
    if (data !== null) setter(data);
    setLoading(false);
  };

  const fetchMetaInsights = async () => {
    setLoading(true);
    setError("");
    const data = await authFetch("/admin/meta-insights");
    if (data !== null) setLiveMeta(data);
    setLoading(false);
  };

  // ── User role editing ──────────────────────────────────────────────────────
  const handleEdit = (u) => {
    setEditingId(u.username);
    setEditRole(u.role);
  };

  const handleSave = async (username) => {
    const data = await authFetch(`/admin/users/${username}/role`, {
      method: "PATCH",
      body: JSON.stringify({ role: editRole }),
    });
    if (data !== null) {
      setUsers((prev) =>
        prev.map((u) => (u.username === username ? { ...u, role: editRole } : u))
      );
    }
    setEditingId(null);
  };

  const handleRefresh = () => {
    setError("");
    if (activeTab === "users") loadUsers();
    else if (activeTab === "events") fetchMemory("events", setEvents);
    else if (activeTab === "strategies") fetchMemory("strategies", setStrategies);
    else if (activeTab === "prompts") fetchMemory("prompts", setPrompts);
    else if (activeTab === "meta") fetchMetaInsights();
  };

  const tabs = [
    { id: "users",      label: "Users",          icon: <FaUserShield /> },
    { id: "events",     label: "Investigations",  icon: <FaHistory /> },
    { id: "strategies", label: "Strategies",      icon: <FaBrain /> },
    { id: "prompts",    label: "Prompts",          icon: <FaBolt /> },
    { id: "meta",       label: "Meta Insights",    icon: <FaMicrochip /> },
  ];

  return (
    <div className="glass-panel p-6 flex flex-col gap-6" id="admin">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-dark-border flex-wrap gap-3">
        <h2 className="text-xl font-bold text-white flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center border border-purple-500/20 shadow-[0_0_15px_rgba(168,85,247,0.2)]">
            <FaServer />
          </div>
          Admin Dashboard
        </h2>

        <div className="flex items-center gap-2 flex-wrap">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? "bg-purple-500 text-white"
                  : "bg-dark-bg text-gray-400 hover:text-white hover:bg-white/5"
              }`}
            >
              {tab.icon}
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}

          {/* Refresh button */}
          <button
            onClick={handleRefresh}
            disabled={loading}
            title="Refresh"
            className="ml-2 p-2 rounded-lg bg-dark-bg text-gray-400 hover:text-white hover:bg-white/5 transition-colors disabled:opacity-40"
          >
            <FaSync className={loading ? "animate-spin" : ""} />
          </button>
        </div>
      </div>

      {/* Error banner */}
      {error && (
        <div className="flex items-center gap-3 px-4 py-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
          <FaExclamationTriangle className="flex-shrink-0" />
          <span>{error}</span>
          <button
            onClick={handleRefresh}
            className="ml-auto text-xs underline hover:text-red-300"
          >
            Retry
          </button>
        </div>
      )}

      {/* Content */}
      <div className="overflow-x-auto min-h-[300px]">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-40 gap-3 text-gray-500">
            <FaSync className="animate-spin text-2xl text-purple-400" />
            <span>Loading system data...</span>
          </div>
        ) : (
          <>
            {/* ── USERS TAB ── */}
            {activeTab === "users" && (
              <table className="w-full text-left text-sm text-gray-400">
                <thead className="text-xs text-gray-500 uppercase bg-[#0B1324] border-b border-dark-border">
                  <tr>
                    <th className="px-6 py-4 font-semibold">Username</th>
                    <th className="px-6 py-4 font-semibold">Email</th>
                    <th className="px-6 py-4 font-semibold">Role</th>
                    <th className="px-6 py-4 font-semibold">Verified</th>
                    <th className="px-6 py-4 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="px-6 py-10 text-center text-gray-500 italic">
                        No users found.{" "}
                        <button onClick={loadUsers} className="text-purple-400 underline ml-1">
                          Retry
                        </button>
                      </td>
                    </tr>
                  ) : (
                    users.map((u, i) => (
                      <tr key={i} className="border-b border-dark-border/50 hover:bg-white/5">
                        <td className="px-6 py-4 text-gray-200 font-medium">{u.username}</td>
                        <td className="px-6 py-4 text-gray-400 text-xs">{u.email || "—"}</td>
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
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-bold border uppercase ${
                                u.role === "admin"
                                  ? "bg-purple-500/10 text-purple-400 border-purple-500/30"
                                  : u.role === "analyst"
                                  ? "bg-blue-500/10 text-blue-400 border-blue-500/30"
                                  : "bg-gray-500/10 text-gray-400 border-gray-500/30"
                              }`}
                            >
                              {u.role || "viewer"}
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`text-xs font-semibold ${u.verified ? "text-green-400" : "text-yellow-400"}`}>
                            {u.verified ? "✓ Verified" : "⚠ Unverified"}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          {editingId === u.username ? (
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => handleSave(u.username)}
                                className="text-green-400 p-2 hover:text-green-300"
                              >
                                <FaSave size={16} />
                              </button>
                              <button
                                onClick={() => setEditingId(null)}
                                className="text-gray-500 p-2 hover:text-gray-300 text-xs"
                              >
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => handleEdit(u)}
                              className="text-purple-400 p-2 hover:text-purple-300"
                            >
                              <FaEdit size={16} />
                            </button>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            )}

            {/* ── EVENTS TAB ── */}
            {activeTab === "events" && (
              <table className="w-full text-left text-sm text-gray-400">
                <thead className="text-xs text-gray-500 uppercase bg-[#0B1324] border-b border-dark-border">
                  <tr>
                    <th className="px-6 py-4 font-semibold">Agent</th>
                    <th className="px-6 py-4 font-semibold">Action</th>
                    <th className="px-6 py-4 font-semibold">Details</th>
                    <th className="px-6 py-4 font-semibold">Time</th>
                  </tr>
                </thead>
                <tbody>
                  {events.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="px-6 py-10 text-center text-gray-500 italic">
                        No investigation history yet. Run an analysis to see agent events.
                      </td>
                    </tr>
                  ) : (
                    events
                      .slice()
                      .reverse()
                      .map((e, i) => (
                        <tr key={i} className="border-b border-dark-border/50 hover:bg-white/5">
                          <td className="px-6 py-4 text-purple-300 font-medium whitespace-nowrap">{e.agent}</td>
                          <td className="px-6 py-4 text-gray-300">{e.action}</td>
                          <td className="px-6 py-4 font-mono text-xs max-w-sm truncate text-gray-500">
                            {JSON.stringify(e.details)}
                          </td>
                          <td className="px-6 py-4 text-xs text-gray-600 whitespace-nowrap">
                            {e.timestamp ? new Date(e.timestamp).toLocaleTimeString() : "—"}
                          </td>
                        </tr>
                      ))
                  )}
                </tbody>
              </table>
            )}

            {/* ── STRATEGIES TAB ── */}
            {activeTab === "strategies" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {strategies.length === 0 ? (
                  <div className="col-span-2 text-center text-gray-500 py-10 italic">
                    No optimized strategies logged yet. Run investigations to build strategy memory.
                  </div>
                ) : (
                  strategies.map((s, i) => (
                    <div key={i} className="bg-dark-bg border border-dark-border rounded-xl p-4">
                      <h4 className="text-cyan-400 font-semibold text-sm mb-2 truncate">{s.goal}</h4>
                      <pre className="text-xs text-gray-400 whitespace-pre-wrap font-mono bg-black/30 p-3 rounded-lg overflow-x-auto max-h-40">
                        {JSON.stringify(s.strategy, null, 2)}
                      </pre>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* ── PROMPTS TAB ── */}
            {activeTab === "prompts" && (
              <div className="space-y-4">
                {Object.keys(prompts).length === 0 ? (
                  <div className="text-center text-gray-500 py-10 italic">
                    No dynamically optimized prompts yet. Prompts are updated when the Critic scores below 0.7.
                  </div>
                ) : (
                  Object.entries(prompts).map(([agent, txt]) => (
                    <div key={agent} className="bg-dark-bg border border-purple-500/20 rounded-xl p-4">
                      <h4 className="text-purple-400 font-bold mb-2 flex items-center gap-2">
                        <FaBolt /> {agent}
                      </h4>
                      <p className="text-sm text-gray-300 bg-black/40 p-3 rounded border border-dark-border/50 font-mono italic leading-relaxed">
                        {txt}
                      </p>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* ── META INSIGHTS TAB ── */}
            {activeTab === "meta" && (
              <div className="p-2">
                <p className="text-xs text-gray-500 mb-4 italic">
                  Meta-intelligence data reflects the last system execution. Run an investigation to populate these insights.
                </p>
                <MetaInsightsPanel metaInsights={liveMeta || metaInsights} />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default AdminPanel;
