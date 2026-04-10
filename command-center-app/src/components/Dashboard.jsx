import { useState, useEffect, useCallback } from "react";
import socket from "../services/socket";
import { playRingtone, stopRingtone, unlockRingtoneAudio } from "../services/ringtone";
import CallScreen from "./CallScreen";

export default function Dashboard({ operator, onLogout }) {
  const operatorId = operator.id;
  const [queue, setQueue] = useState([]);
  const [activeCall, setActiveCall] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Live clock
  useEffect(() => {
    const tick = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(tick);
  }, []);

  // Unlock audio
  useEffect(() => {
    const unlock = async () => await unlockRingtoneAudio();
    window.addEventListener("pointerdown", unlock);
    window.addEventListener("keydown", unlock);
    return () => {
      window.removeEventListener("pointerdown", unlock);
      window.removeEventListener("keydown", unlock);
    };
  }, []);

  useEffect(() => {
    const register = () => socket.emit("register-operator", operatorId);
    if (socket.connected) register();
    socket.on("connect", register);
    socket.on("incoming-call", ({ callerId, callerName, channelName }) => {
      setQueue((prev) => {
        if (prev.some((c) => c.channelName === channelName)) return prev;
        return [...prev, { callerId, callerName, channelName }];
      });
      playRingtone();
    });
    socket.on("call-ended", ({ channelName }) => {
      setQueue((prev) => prev.filter((c) => c.channelName !== channelName));
    });
    socket.on("call-taken", ({ channelName }) => {
      setQueue((prev) => prev.filter((c) => c.channelName !== channelName));
    });
    return () => {
      socket.off("connect", register);
      socket.off("incoming-call");
      socket.off("call-ended");
      socket.off("call-taken");
      stopRingtone();
    };
  }, [operatorId]);

  useEffect(() => {
    if (queue.length === 0) stopRingtone();
  }, [queue]);

  const handleAccept = useCallback((call) => {
    socket.emit("accept-call", { callerId: call.callerId, channelName: call.channelName });
    setActiveCall(call);
    setQueue((prev) => prev.filter((c) => c.channelName !== call.channelName));
  }, []);

  const handleReject = useCallback((call) => {
    socket.emit("reject-call", { callerId: call.callerId, channelName: call.channelName });
    setQueue((prev) => prev.filter((c) => c.channelName !== call.channelName));
  }, []);

  const handleRejectAll = useCallback(() => {
    queue.forEach((call) => {
      socket.emit("reject-call", { callerId: call.callerId, channelName: call.channelName });
    });
    setQueue([]);
  }, [queue]);

  const handleEndCall = useCallback(() => {
    stopRingtone();
    setActiveCall(null);
  }, []);

  const formatClock = (d) => {
    return d.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false });
  };

  const formatDate = (d) => {
    return d.toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
  };

  // ── Active Call ──
  if (activeCall) {
    return (
      <CallScreen
        channelName={activeCall.channelName}
        userId={operatorId}
        callerId={activeCall.callerId}
        callerName={activeCall.callerName}
        onEnd={handleEndCall}
        queueCount={queue.length}
      />
    );
  }

  // ── Dashboard ──
  return (
    <div className="grid-bg" style={{ minHeight: "100vh", position: "relative" }}>
      {/* Background */}
      <div className="bg-orbs">
        <div className="bg-orb bg-orb-1" />
        <div className="bg-orb bg-orb-2" />
        <div className="bg-orb bg-orb-3" />
      </div>
      <div style={{ position: "fixed", inset: 0, overflow: "hidden", pointerEvents: "none", zIndex: 0 }}>
        <div className="scan-line" />
      </div>

      {/* Content */}
      <div style={{ position: "relative", zIndex: 1, maxWidth: 560, margin: "0 auto", padding: "32px 16px 40px" }}>

        {/* ── HEADER ── */}
        <div className="header-card animate-fade-up" style={{ padding: "24px 28px", marginBottom: 20 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            {/* Icon */}
            <div className="avatar-ring" style={{ width: 56, height: 56, flexShrink: 0 }}>
              <div style={{
                width: 56, height: 56, borderRadius: "50%",
                background: "linear-gradient(135deg, rgba(14,165,233,0.3), rgba(124,58,237,0.2))",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <svg width="26" height="26" fill="none" viewBox="0 0 24 24">
                  <defs>
                    <linearGradient id="ccDash" x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0%" stopColor="#38bdf8" />
                      <stop offset="100%" stopColor="#a78bfa" />
                    </linearGradient>
                  </defs>
                  <path fill="url(#ccDash)" d="M20.01 15.38c-1.23 0-2.42-.2-3.53-.56a.977.977 0 0 0-1.01.24l-1.57 1.97c-2.83-1.35-5.48-3.9-6.89-6.83l1.95-1.66c.27-.28.35-.67.24-1.02-.37-1.11-.56-2.3-.56-3.53 0-.54-.45-.99-.99-.99H4.19C3.65 3 3 3.24 3 3.99 3 13.28 10.73 21 20.01 21c.71 0 .99-.63.99-1.18v-3.45c0-.54-.45-.99-.99-.99z" />
                </svg>
              </div>
            </div>

            {/* Title & clock */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ marginBottom: 2 }}>
                <span style={{ fontSize: "0.6rem", fontWeight: 700, letterSpacing: "0.25em", textTransform: "uppercase", color: "#38bdf8" }}>
                  ✦ SISTEM KOMUNIKASI
                </span>
              </div>
              <h1 style={{
                fontSize: "1.25rem", fontWeight: 800, margin: 0,
                background: "linear-gradient(135deg, #f1f5f9, #94a3b8)",
                WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
                backgroundClip: "text"
              }}>
                Command Center
              </h1>
              <p style={{ color: "#475569", fontSize: "0.72rem", margin: "2px 0 0", fontFamily: "Outfit, sans-serif" }}>
                {operator.name} — {formatDate(currentTime)}
              </p>
            </div>

            {/* Clock */}
            <div style={{ textAlign: "right", flexShrink: 0 }}>
              <div style={{
                fontFamily: "Outfit, sans-serif",
                fontSize: "1.3rem", fontWeight: 600,
                background: "linear-gradient(135deg, #38bdf8, #a78bfa)",
                WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
                backgroundClip: "text",
                letterSpacing: "0.06em",
              }}>
                {formatClock(currentTime)}
              </div>
            </div>
          </div>

          {/* Status bar */}
          <div style={{ marginTop: 16, paddingTop: 16, borderTop: "1px solid rgba(255,255,255,0.06)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div className="status-badge-online">
              <span className="status-dot" />
              Online & Listening
            </div>
            {queue.length > 0 && (
              <div className="queue-waiting-badge">
                <svg width="12" height="12" fill="currentColor" viewBox="0 0 24 24" style={{ flexShrink: 0 }}>
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z" />
                </svg>
                {queue.length} panggilan masuk
              </div>
            )}
          </div>
        </div>

        {/* ── QUEUE AREA ── */}
        <div className="animate-fade-up" style={{ animationDelay: "0.1s", opacity: 0, animationFillMode: "forwards" }}>

          {queue.length === 0 ? (
            /* Empty state */
            <div className="glass-card" style={{ padding: "48px 32px", textAlign: "center" }}>
              {/* Radar animation */}
              <div style={{ display: "flex", justifyContent: "center", marginBottom: 24 }}>
                <div style={{ position: "relative", width: 80, height: 80 }}>
                  {/* Radar sweep */}
                  <div style={{
                    position: "absolute", inset: 0, borderRadius: "50%",
                    border: "1px solid rgba(14,165,233,0.2)",
                  }} />
                  <div style={{
                    position: "absolute", inset: 12, borderRadius: "50%",
                    border: "1px solid rgba(14,165,233,0.2)",
                  }} />
                  <div style={{
                    position: "absolute", inset: 24, borderRadius: "50%",
                    border: "1px solid rgba(14,165,233,0.2)",
                  }} />
                  <div style={{
                    position: "absolute", inset: 0, borderRadius: "50%",
                    background: "conic-gradient(from 0deg, rgba(14,165,233,0.4) 0deg, transparent 60deg)",
                    animation: "spin-ring 3s linear infinite",
                  }} />
                  <div style={{
                    position: "absolute", inset: 0, display: "flex",
                    alignItems: "center", justifyContent: "center",
                  }}>
                    <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#0ea5e9", boxShadow: "0 0 12px #0ea5e9" }} />
                  </div>
                </div>
              </div>

              {/* Listening dots */}
              <div className="listening-dots" style={{ justifyContent: "center", marginBottom: 16 }}>
                {[0, 1, 2].map(i => (
                  <div key={i} className="listening-dot" style={{ width: 10, height: 10, animationDelay: `${i * 0.25}s` }} />
                ))}
              </div>

              <p style={{ color: "#475569", fontSize: "0.875rem", margin: 0 }}>
                Menunggu panggilan masuk...
              </p>
              <p style={{ color: "#334155", fontSize: "0.75rem", marginTop: 6 }}>
                Sistem aktif dan siap menerima
              </p>
            </div>
          ) : (
            /* Queue list */
            <>
              {/* Queue header */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12, padding: "0 4px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#f97316", boxShadow: "0 0 10px #f97316", animation: "pulse-orange 1s infinite" }} />
                  <span style={{ fontSize: "0.8rem", fontWeight: 700, color: "#94a3b8", letterSpacing: "0.05em", textTransform: "uppercase" }}>
                    Antrian Panggilan
                  </span>
                  <span style={{
                    background: "rgba(249,115,22,0.15)", border: "1px solid rgba(249,115,22,0.25)",
                    color: "#fb923c", fontSize: "0.7rem", fontWeight: 700,
                    padding: "2px 8px", borderRadius: 999,
                  }}>
                    {queue.length}
                  </span>
                </div>
                {queue.length > 1 && (
                  <button
                    id="reject-all-btn"
                    onClick={handleRejectAll}
                    className="btn-reject-all"
                  >
                    Tolak Semua
                  </button>
                )}
              </div>

              {/* Call cards */}
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {queue.map((call, idx) => (
                  <div
                    key={call.channelName}
                    className="call-card"
                    style={{ animationDelay: `${idx * 0.08}s` }}
                  >
                    {/* Avatar */}
                    <div style={{
                      width: 46, height: 46, borderRadius: "50%", flexShrink: 0,
                      background: "linear-gradient(135deg, rgba(124,58,237,0.25), rgba(59,130,246,0.2))",
                      border: "1px solid rgba(124,58,237,0.2)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}>
                      <svg width="22" height="22" fill="none" viewBox="0 0 24 24">
                        <defs>
                          <linearGradient id={`avatar-${idx}`} x1="0" y1="0" x2="1" y2="1">
                            <stop offset="0%" stopColor="#a855f7" />
                            <stop offset="100%" stopColor="#60a5fa" />
                          </linearGradient>
                        </defs>
                        <path fill={`url(#avatar-${idx})`} d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z" />
                      </svg>
                    </div>

                    {/* Caller info */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontWeight: 700, fontSize: "0.95rem", margin: 0, marginBottom: 4, color: "#e2e8f0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {call.callerName || call.callerId}
                      </p>
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <span className="status-dot-orange" />
                        <span style={{ fontSize: "0.72rem", color: "#fb923c", fontWeight: 500 }}>Sedang Berdering</span>
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
                      <button
                        id={`reject-${call.callerId}`}
                        onClick={() => handleReject(call)}
                        className="action-btn action-btn-reject"
                        title="Tolak"
                      >
                        <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 9c-1.6 0-3.15.25-4.6.72v3.1c0 .39-.23.74-.56.9-.98.49-1.87 1.12-2.66 1.85-.18.18-.43.28-.7.28-.28 0-.53-.11-.71-.29L.29 13.08a.956.956 0 0 1-.29-.7c0-.28.11-.53.29-.71C3.34 8.78 7.46 7 12 7s8.66 1.78 11.71 4.67c.18.18.29.43.29.71 0 .28-.11.53-.29.71l-2.48 2.48c-.18.18-.43.29-.71.29-.27 0-.52-.11-.7-.28a11.27 11.27 0 0 0-2.67-1.85.996.996 0 0 1-.56-.9v-3.1C15.15 9.25 13.6 9 12 9z" />
                        </svg>
                      </button>
                      <button
                        id={`accept-${call.callerId}`}
                        onClick={() => handleAccept(call)}
                        className="action-btn action-btn-accept"
                        title="Terima"
                      >
                        <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M20.01 15.38c-1.23 0-2.42-.2-3.53-.56a.977.977 0 0 0-1.01.24l-1.57 1.97c-2.83-1.35-5.48-3.9-6.89-6.83l1.95-1.66c.27-.28.35-.67.24-1.02-.37-1.11-.56-2.3-.56-3.53 0-.54-.45-.99-.99-.99H4.19C3.65 3 3 3.24 3 3.99 3 13.28 10.73 21 20.01 21c.71 0 .99-.63.99-1.18v-3.45c0-.54-.45-.99-.99-.99z" />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* ── FOOTER INFO ── */}
        <div style={{ marginTop: 24, textAlign: "center" }}>
          <p style={{ color: "#1e293b", fontSize: "0.7rem", letterSpacing: "0.1em", marginBottom: 8 }}>
            OPERATOR: <span style={{ color: "#334155", fontFamily: "monospace" }}>{operator.name}</span>
          </p>
          <button
            id="operator-logout-btn"
            onClick={onLogout}
            style={{
              background: "rgba(239,68,68,0.06)",
              border: "1px solid rgba(239,68,68,0.12)",
              color: "#64748b",
              fontSize: "0.72rem",
              fontWeight: 500,
              cursor: "pointer",
              transition: "all 0.2s",
              padding: "6px 16px",
              borderRadius: 999,
              fontFamily: "Inter, sans-serif",
            }}
            onMouseEnter={e => { e.target.style.color = '#ef4444'; e.target.style.borderColor = 'rgba(239,68,68,0.3)'; }}
            onMouseLeave={e => { e.target.style.color = '#64748b'; e.target.style.borderColor = 'rgba(239,68,68,0.12)'; }}
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}
