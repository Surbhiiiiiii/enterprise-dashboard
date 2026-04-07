import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { apiGetAlerts, apiClearAlerts } from "../api";

const SEVERITY_STYLES = {
  HIGH: {
    bg: "bg-red-500/10",
    border: "border-red-500/40",
    badge: "bg-red-500/20 text-red-400 border border-red-500/40",
    dot: "bg-red-500 animate-pulse",
    label: "text-red-400",
  },
  CRITICAL: {
    bg: "bg-red-600/15",
    border: "border-red-600/50",
    badge: "bg-red-600/20 text-red-300 border border-red-600/40",
    dot: "bg-red-600 animate-pulse",
    label: "text-red-300",
  },
  MEDIUM: {
    bg: "bg-orange-500/10",
    border: "border-orange-500/30",
    badge: "bg-orange-500/20 text-orange-400 border border-orange-500/40",
    dot: "bg-orange-400",
    label: "text-orange-400",
  },
  LOW: {
    bg: "bg-gray-500/10",
    border: "border-gray-700/50",
    badge: "bg-gray-600/30 text-gray-400 border border-gray-600/40",
    dot: "bg-gray-400",
    label: "text-gray-400",
  },
};

function getSeverityStyle(sev) {
  const key = String(sev || "LOW").toUpperCase();
  return SEVERITY_STYLES[key] || SEVERITY_STYLES.LOW;
}

function formatTime(ts) {
  if (!ts) return "";
  try {
    const d = new Date(ts);
    return d.toLocaleString();
  } catch {
    return ts;
  }
}

export default function AlertsPanel({ wsAlert, user }) {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [unread, setUnread] = useState(0);
  const [expanded, setExpanded] = useState(null);
  const [toast, setToast] = useState(null);
  const [clearing, setClearing] = useState(false);
  const lastSeenRef = useRef(sessionStorage.getItem("alerts_last_seen") || "");
  const audioCtxRef = useRef(null);
  const isAdmin = user?.role === "admin";

  // ── Fetch alerts ──────────────────────────────────────────────────────────
  const fetchAlerts = useCallback(async () => {
    try {
      const data = await apiGetAlerts();
      if (Array.isArray(data)) {
        setAlerts(data);
        const lastSeen = lastSeenRef.current;
        const newUnread = data.filter(
          (a) => !lastSeen || a.timestamp > lastSeen
        ).length;
        setUnread(newUnread);
      }
    } catch {
      /* silent */
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAlerts();
    const interval = setInterval(fetchAlerts, 15000);
    return () => clearInterval(interval);
  }, [fetchAlerts]);

  // ── Handle WS alert push ──────────────────────────────────────────────────
  useEffect(() => {
    if (!wsAlert) return;
    setAlerts((prev) => [wsAlert, ...prev]);
    setUnread((u) => u + 1);
    setToast(wsAlert);
    playAlertSound();
    setTimeout(() => setToast(null), 5000);
  }, [wsAlert]);

  // ── Mark read ─────────────────────────────────────────────────────────────
  const markAllRead = () => {
    const now = new Date().toISOString();
    sessionStorage.setItem("alerts_last_seen", now);
    lastSeenRef.current = now;
    setUnread(0);
  };

  // ── Clear all alerts (admin only) ─────────────────────────────────────────
  const clearAllAlerts = async () => {
    if (!window.confirm("Delete all alerts from the database? This cannot be undone.")) return;
    setClearing(true);
    try {
      await apiClearAlerts();
      setAlerts([]);
      setUnread(0);
    } catch (err) {
      alert("Failed to clear alerts: " + err.message);
    } finally {
      setClearing(false);
    }
  };

  function playAlertSound() {
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
      }
      const ctx = audioCtxRef.current;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      osc.frequency.setValueAtTime(660, ctx.currentTime + 0.1);
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.5);
    } catch { /* browser may block autoplay */ }
  }

  return (
    <div className="relative">
      {/* Toast Notification */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, x: 60 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 60 }}
            className="fixed top-6 right-6 z-[9999] max-w-sm bg-[#1a0a0a] border border-red-500/50 rounded-xl p-4 shadow-[0_0_30px_rgba(239,68,68,0.3)]"
          >
            <div className="flex items-start gap-3">
              <span className="text-2xl">🚨</span>
              <div>
                <p className="text-red-400 font-bold text-sm">Critical Alert</p>
                <p className="text-gray-300 text-xs mt-1 line-clamp-2">
                  {toast.issue || toast.message || "High severity incident detected"}
                </p>
              </div>
              <button onClick={() => setToast(null)} className="text-gray-600 hover:text-gray-400 ml-auto">✕</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Panel Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-2">
            <svg className="w-4 h-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            Alerts Panel
          </h3>
          {unread > 0 && (
            <motion.span
              initial={{ scale: 0 }} animate={{ scale: 1 }}
              className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-red-500 text-white text-xs font-bold"
            >
              {unread > 9 ? "9+" : unread}
            </motion.span>
          )}
        </div>
        <div className="flex items-center gap-3">
          <button onClick={fetchAlerts} className="text-xs text-gray-500 hover:text-gray-300 transition-colors">
            Refresh
          </button>
          {unread > 0 && (
            <button onClick={markAllRead} className="text-xs text-cyan-500 hover:text-cyan-300 transition-colors">
              Mark all read
            </button>
          )}
          {isAdmin && alerts.length > 0 && (
            <button
              onClick={clearAllAlerts}
              disabled={clearing}
              className="text-xs text-red-500 hover:text-red-300 transition-colors disabled:opacity-50"
            >
              {clearing ? "Clearing..." : "Clear All"}
            </button>
          )}
        </div>
      </div>

      {/* Alert List */}
      <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1 custom-scrollbar">
        {loading && (
          <div className="text-center py-8 text-gray-500 text-sm">Loading alerts...</div>
        )}
        {!loading && alerts.length === 0 && (
          <div className="text-center py-8">
            <div className="w-12 h-12 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="text-gray-500 text-sm">No alerts detected</p>
            <p className="text-gray-600 text-xs mt-1">System is operating normally</p>
          </div>
        )}
        {!loading && alerts.map((alert, i) => {
          const sev = String(alert.severity || "LOW").toUpperCase();
          const style = getSeverityStyle(sev);
          const isOpen = expanded === i;
          const isNew = lastSeenRef.current && alert.timestamp > lastSeenRef.current;

          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className={`rounded-lg border ${style.border} ${style.bg} overflow-hidden transition-all`}
            >
              <button
                className="w-full p-3 flex items-center gap-3 text-left hover:bg-white/5 transition-colors"
                onClick={() => setExpanded(isOpen ? null : i)}
              >
                <span className={`w-2 h-2 rounded-full flex-shrink-0 ${style.dot}`} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${style.badge}`}>{sev}</span>
                    {isNew && (
                      <span className="text-xs font-bold px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-400 border border-blue-500/30">NEW</span>
                    )}
                  </div>
                  <p className="text-sm text-gray-200 font-medium truncate mt-1">
                    {alert.issue || "System Alert"}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">{formatTime(alert.timestamp)}</p>
                </div>
                <svg
                  className={`w-4 h-4 text-gray-500 flex-shrink-0 transition-transform ${isOpen ? "rotate-180" : ""}`}
                  fill="none" stroke="currentColor" viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              <AnimatePresence>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="border-t border-gray-700/50"
                  >
                    <div className="p-3 space-y-2">
                      {[
                        ["Root Cause", alert.root_cause],
                        ["Recommended Action", alert.recommended_action || alert.action],
                        ["Notified", alert.notified ? "Yes" : "No"],
                      ].map(([label, val]) => val && (
                        <div key={label} className="flex gap-2 text-xs">
                          <span className="text-gray-500 w-36 flex-shrink-0">{label}</span>
                          <span className="text-gray-300">{String(val)}</span>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
