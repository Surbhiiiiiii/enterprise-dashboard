import React, { useState, useEffect, useRef, useCallback } from "react";
import AnalysisPanel from "./components/AnalysisPanel";
import ResultPanel from "./components/ResultPanel";
import AgentPipeline from "./components/AgentPipeline";
import AnalyticsPanel from "./components/AnalyticsPanel";
import Sidebar from "./components/Sidebar";
import KpiCards from "./components/KpiCards";
import TrendChart from "./components/TrendChart";
import ActivityLog from "./components/ActivityLog";
import IncidentTable from "./components/IncidentTable";
import AdminPanel from "./components/AdminPanel";
import AlertsPanel from "./components/AlertsPanel";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import LandingPage from "./pages/LandingPage";
import SystemOverview from "./components/SystemOverview";
import AiActivityTimeline from "./components/AiActivityTimeline";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { decodeToken, clearSession, getToken, apiGetDashboard } from "./api";

function App() {
  const [result, setResult] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [user, setUser] = useState(null);
  const [liveStatus, setLiveStatus] = useState({ planner: "idle", analyst: "idle", executor: "idle", critic: "idle" });
  const [liveLogs, setLiveLogs] = useState([]);
  const [wsAlert, setWsAlert] = useState(null);
  const [alertCount, setAlertCount] = useState(0);
  const ws = useRef(null);

  // ── Restore session from JWT on load ──────────────────────────────────────
  useEffect(() => {
    const token = getToken();
    if (token) {
      const payload = decodeToken(token);
      if (payload && payload.exp * 1000 > Date.now()) {
        setUser({
          username: payload.sub,
          role: payload.role,
          email: payload.email,
          token,
        });
      } else {
        clearSession();
      }
    }
  }, []);

  const handleLogout = useCallback(() => {
    clearSession();
    setUser(null);
    setResult(null);
    setLiveLogs([]);
  }, []);

  // ── WebSocket + Dashboard ─────────────────────────────────────────────────
  useEffect(() => {
    if (!user) return;

    // Fetch initial dashboard
    const fetchDashboard = async () => {
      try {
        const data = await apiGetDashboard();
        if (data) setResult((prev) => prev ? prev : data);
      } catch (err) {
        console.error("Dashboard fetch error:", err);
      }
    };
    fetchDashboard();

    let reconnectTimer;
    const connectWebSocket = () => {
      const wsBase = (process.env.REACT_APP_API_URL || "http://localhost:8000")
        .replace(/^https/, "wss")
        .replace(/^http/, "ws");
      ws.current = new WebSocket(`${wsBase}/ws`);

      ws.current.onmessage = (event) => {
        const data = JSON.parse(event.data);

        if (data.type === "pong") return;

        if (data.agent && data.status) {
          setLiveStatus((prev) => ({
            ...prev,
            [data.agent.toLowerCase()]: data.status,
          }));
        }

        // Real-time alert push
        if (data.alert === true) {
          setWsAlert(data);
          setAlertCount((c) => c + 1);
        }

        setLiveLogs((prev) => [
          ...prev,
          {
            id: `evt_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
            time: new Date().toISOString().split("T")[1].slice(0, 12),
            agent: data.agent,
            message: data.message,
            type: data.type || "info",
          },
        ]);
      };

      ws.current.onclose = () => {
        reconnectTimer = setTimeout(() => {
          if (user) connectWebSocket();
        }, 3000);
      };
    };

    connectWebSocket();

    const pingInterval = setInterval(() => {
      if (ws.current && ws.current.readyState === WebSocket.OPEN) {
        ws.current.send(JSON.stringify({ action: "ping", timestamp: Date.now() }));
      }
    }, 2000);

    return () => {
      clearInterval(pingInterval);
      clearTimeout(reconnectTimer);
      if (ws.current) {
        ws.current.onclose = null;
        ws.current.close();
      }
    };
  }, [user]);

  const role = user?.role || "viewer";

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={!user ? <LandingPage /> : <Navigate to="/dashboard" replace />} />
        <Route path="/login" element={!user ? <LoginPage setUser={setUser} /> : <Navigate to="/dashboard" replace />} />
        <Route path="/register" element={!user ? <RegisterPage /> : <Navigate to="/dashboard" replace />} />
        <Route
          path="/dashboard"
          element={
            !user ? (
              <Navigate to="/login" replace />
            ) : (
              <div className="min-h-screen text-gray-200 font-sans selection:bg-ai-blue/30 selection:text-ai-cyan relative z-0">

                {/* Sidebar */}
                <Sidebar open={sidebarOpen} setUser={(u) => { if (!u) handleLogout(); else setUser(u); }} user={user} />

                {/* Main Content */}
                <div className={`transition-all duration-300 ease-in-out flex flex-col min-h-screen ${sidebarOpen ? "ml-56 lg:ml-64" : "ml-0"}`}>

                  {/* Header */}
                  <header className="sticky top-0 z-30 bg-dark-bg/80 backdrop-blur-md border-b border-dark-border px-6 py-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <button
                          onClick={() => setSidebarOpen(!sidebarOpen)}
                          className="text-gray-400 hover:text-white transition-colors"
                          aria-label="Toggle Sidebar"
                        >
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                          </svg>
                        </button>
                        <div>
                          <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-3">
                            AI Ops Core
                            <span className="flex items-center gap-1.5 text-xs font-medium px-2 py-1 rounded-full bg-ai-blue/10 text-ai-blue border border-ai-blue/20">
                              <span className="w-1.5 h-1.5 rounded-full bg-ai-blue animate-pulse" />
                              System Online
                            </span>
                          </h1>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        {/* Alert Badge (header) */}
                        {alertCount > 0 && (
                          <div className="relative">
                            <button className="p-2 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20 transition-colors">
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                              </svg>
                            </button>
                            <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 text-white text-xs flex items-center justify-center font-bold">
                              {alertCount > 9 ? "9+" : alertCount}
                            </span>
                          </div>
                        )}

                        {user && (
                          <div className="flex items-center gap-3 pl-4 border-l border-dark-border">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-ai-blue to-ai-cyan flex items-center justify-center text-white font-bold text-sm shadow-[0_0_10px_rgba(56,189,248,0.3)]">
                              {user.username.charAt(0).toUpperCase()}
                            </div>
                            <div className="hidden sm:block">
                              <div className="text-sm font-medium text-white">{user.username}</div>
                              <div className="text-xs text-ai-cyan uppercase font-bold tracking-wider">{role}</div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </header>

                  {/* Dashboard Grid */}
                  <main className="flex-1 p-6 md:p-8 shrink-0 space-y-8">

                    {/* Goal Input Panel — Analyst & Admin only */}
                    {(role === "analyst" || role === "admin") && (
                      <section id="dashboard" className="glass-panel p-8 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-ai-blue/10 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none -mr-32 -mt-32" />
                        <div className="max-w-4xl mx-auto space-y-6 text-center">
                          <h2 className="text-3xl font-bold text-gradient mb-2 tracking-tight">
                            Autonomous Intelligence Engine
                          </h2>
                          <p className="text-gray-400 text-sm max-w-2xl mx-auto">
                            Deploy the multi-agent system to analyze datasets, URLs, and documents — formulate strategies and execute automated responses.
                          </p>
                          <div className="pt-4">
                            <AnalysisPanel setResult={setResult} user={user} setLiveStatus={setLiveStatus} setLiveLogs={setLiveLogs} />
                          </div>
                        </div>
                      </section>
                    )}

                    {/* Agent Pipeline */}
                    {(role === "analyst" || role === "admin") && (
                      <section id="agents" className="relative z-10 glass-panel p-6">
                        <div className="flex items-center justify-between mb-6 border-b border-dark-border pb-4">
                          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                            <svg className="w-5 h-5 text-ai-cyan" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                            Agent Execution Pipeline
                          </h2>
                        </div>
                        <div className="py-4">
                          <AgentPipeline result={result} liveStatus={liveStatus} />
                        </div>
                      </section>
                    )}

                    {/* Main Dashboard Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

                      {/* KPI Cards */}
                      <div id="kpi" className="lg:col-span-12">
                        <KpiCards metrics={result?.metrics} />
                      </div>

                      {/* System Overview for Viewer & Admin */}
                      {(role === "viewer" || role === "admin") && (
                        <div className="lg:col-span-12">
                          <SystemOverview result={result} />
                        </div>
                      )}

                      {/* Analyst & Admin deep tools */}
                      {(role === "analyst" || role === "admin") && (
                        <>
                          {/* Left Column */}
                          <div className="lg:col-span-8 flex flex-col gap-6">
                            <div id="trend" className="glass-panel p-6 h-96 flex flex-col">
                              <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">Trend Analysis</h3>
                              <div className="flex-1 relative overflow-hidden rounded-lg">
                                <TrendChart trends={result?.trends} />
                              </div>
                            </div>

                            <div className="glass-panel-hover p-6">
                              <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">Deep Analytics</h3>
                              <AnalyticsPanel insights={result?.analysis_insights} trends={result?.trends} />
                            </div>

                            <div id="timeline" className="glass-panel p-6 border-ai-blue/30">
                              <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-6 flex items-center gap-2">
                                <svg className="w-4 h-4 text-ai-cyan" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                </svg>
                                AI Activity Timeline
                              </h3>
                              <AiActivityTimeline result={result} liveStatus={liveStatus} />
                            </div>

                            <div id="results" className="glass-panel-hover p-6">
                              <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">Execution Results</h3>
                              <ResultPanel result={result} />
                            </div>
                          </div>

                          {/* Right Column */}
                          <div className="lg:col-span-4 flex flex-col gap-6">
                            {/* Alerts Panel */}
                            <div id="alerts" className="glass-panel p-6">
                            <AlertsPanel wsAlert={wsAlert} user={user} />
                            </div>

                            <div id="activity" className="glass-panel p-6 flex-1 min-h-[300px]">
                              <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">Activity Stream</h3>
                              <ActivityLog liveLogs={liveLogs} />
                            </div>
                          </div>
                        </>
                      )}
                    </div>

                    {/* Incidents Table */}
                    {(role === "analyst" || role === "admin") && (
                      <div id="incidents" className="glass-panel-hover p-6">
                        <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">Critical Incidents</h3>
                        <IncidentTable incidents={result?.incidents} />
                      </div>
                    )}

                    {/* Admin Panel */}
                    {role === "admin" && (
                      <AdminPanel user={user} metaInsights={result?.meta_insights} />
                    )}
                  </main>
                </div>
              </div>
            )
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;