import { useState, useEffect } from "react";
import socket from "../services/socket";
import { playRingback, stopRingback } from "../services/ringtone";
import CallingScreen from "./CallingScreen";
import CallScreen from "./CallScreen";
import LoginPage from "./LoginPage";

export default function CallPage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("idle");
  const [channelName, setChannelName] = useState("");

  useEffect(() => {
    async function restore() {
      const saved = localStorage.getItem("voice_user");
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          const res = await fetch(`/api/auth/verify/${parsed.id}`);
          if (res.ok) {
            const account = await res.json();
            setUser(account);
            setLoading(false);
            return;
          }
        } catch { /* fall through */ }
        localStorage.removeItem("voice_user");
      }
      setLoading(false);
    }
    restore();
  }, []);

  useEffect(() => {
    if (!user) return;
    const register = () => socket.emit("register-user", user.id);
    if (socket.connected) register();
    socket.on("connect", register);
    socket.on("call-ringing", ({ channelName: ch }) => { setChannelName(ch); });
    socket.on("call-accepted", ({ channelName: ch }) => {
      stopRingback();
      setChannelName(ch);
      setStatus("in-call");
    });
    socket.on("call-rejected", () => {
      stopRingback();
      setStatus("idle");
      setChannelName("");
    });
    return () => {
      socket.off("connect", register);
      socket.off("call-ringing");
      socket.off("call-accepted");
      socket.off("call-rejected");
      stopRingback();
    };
  }, [user]);

  const handleLogin = (account) => {
    setUser(account);
    localStorage.setItem("voice_user", JSON.stringify(account));
  };

  const handleLogout = () => {
    localStorage.removeItem("voice_user");
    setUser(null);
    setStatus("idle");
    setChannelName("");
  };

  const handleCall = () => {
    setStatus("calling");
    playRingback();
    socket.emit("call-user", { callerId: user.id });
  };

  const handleCancelCall = () => {
    stopRingback();
    if (channelName) socket.emit("end-call", { channelName, userId: user.id });
    setStatus("idle");
    setChannelName("");
  };

  const handleEndCall = () => {
    stopRingback();
    setStatus("idle");
    setChannelName("");
  };

  // ── Loading ──
  if (loading) {
    return (
      <div className="grid-bg" style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div className="bg-orbs">
          <div className="bg-orb bg-orb-1" />
          <div className="bg-orb bg-orb-2" />
          <div className="bg-orb bg-orb-3" />
        </div>
        <div style={{ textAlign: "center", position: "relative", zIndex: 1 }}>
          <div style={{
            width: 48, height: 48, borderRadius: "50%",
            border: "3px solid rgba(124,58,237,0.3)",
            borderTop: "3px solid #7c3aed",
            animation: "spin-ring 1s linear infinite",
            margin: "0 auto 16px"
          }} />
          <p style={{ color: "#94a3b8", fontSize: "0.875rem" }}>Loading...</p>
        </div>
      </div>
    );
  }

  // ── Login ──
  if (!user) {
    return <LoginPage onLogin={handleLogin} />;
  }

  // ── Calling ──
  if (status === "calling") return <CallingScreen onCancel={handleCancelCall} />;

  // ── In-Call ──
  if (status === "in-call") {
    return <CallScreen channelName={channelName} userId={user.id} onEnd={handleEndCall} />;
  }

  // ── Idle / Home ──
  return (
    <div className="grid-bg" style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "16px", position: "relative" }}>
      <div className="bg-orbs">
        <div className="bg-orb bg-orb-1" />
        <div className="bg-orb bg-orb-2" />
        <div className="bg-orb bg-orb-3" />
      </div>

      <div className="glass-card animate-fade-up" style={{ width: "100%", maxWidth: 420, padding: "40px 36px", textAlign: "center", position: "relative", zIndex: 1 }}>

        {/* Avatar */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: 28 }}>
          <div className="avatar-ring" style={{ width: 88, height: 88, marginBottom: 20 }}>
            <div style={{
              width: 88, height: 88, borderRadius: "50%",
              background: "linear-gradient(135deg, rgba(124,58,237,0.25), rgba(59,130,246,0.25))",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
                <defs>
                  <linearGradient id="phoneGrad" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#a855f7" />
                    <stop offset="100%" stopColor="#38bdf8" />
                  </linearGradient>
                </defs>
                <path fill="url(#phoneGrad)" d="M20.01 15.38c-1.23 0-2.42-.2-3.53-.56a.977.977 0 0 0-1.01.24l-1.57 1.97c-2.83-1.35-5.48-3.9-6.89-6.83l1.95-1.66c.27-.28.35-.67.24-1.02-.37-1.11-.56-2.3-.56-3.53 0-.54-.45-.99-.99-.99H4.19C3.65 3 3 3.24 3 3.99 3 13.28 10.73 21 20.01 21c.71 0 .99-.63.99-1.18v-3.45c0-.54-.45-.99-.99-.99z" />
              </svg>
            </div>
          </div>


          {/* Greeting */}
          <div style={{ marginBottom: 4 }}>
            <span style={{ fontSize: "0.7rem", fontWeight: 600, letterSpacing: "0.18em", textTransform: "uppercase", color: "#a78bfa" }}>Halo, pengguna</span>
          </div>
          <h1 style={{ fontSize: "2rem", fontWeight: 800, margin: 0, background: "linear-gradient(135deg, #f1f5f9, #94a3b8)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
            {user.name}
          </h1>
          <p style={{ color: "#475569", fontSize: "0.75rem", marginTop: 4 }}>
            @{user.username}
          </p>
        </div>

        {/* Divider */}
        <div style={{ height: 1, background: "rgba(255,255,255,0.06)", margin: "0 0 28px" }} />

        {/* Info */}
        <p style={{ color: "#64748b", fontSize: "0.875rem", marginBottom: 28, lineHeight: 1.6 }}>
          Tap tombol di bawah untuk menghubungi<br />
          <span style={{ color: "#a78bfa", fontWeight: 600 }}>Command Center</span>
        </p>

        {/* Call Button */}
        <button
          id="call-btn"
          onClick={handleCall}
          className="btn-neon btn-neon-call"
          style={{ width: "100%", fontSize: "1.05rem", padding: "16px 24px", borderRadius: 18 }}
        >
          <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10 }}>
            <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
              <path d="M20.01 15.38c-1.23 0-2.42-.2-3.53-.56a.977.977 0 0 0-1.01.24l-1.57 1.97c-2.83-1.35-5.48-3.9-6.89-6.83l1.95-1.66c.27-.28.35-.67.24-1.02-.37-1.11-.56-2.3-.56-3.53 0-.54-.45-.99-.99-.99H4.19C3.65 3 3 3.24 3 3.99 3 13.28 10.73 21 20.01 21c.71 0 .99-.63.99-1.18v-3.45c0-.54-.45-.99-.99-.99z" />
            </svg>
            Hubungi Command Center
          </span>
        </button>

        {/* Status */}
        <div style={{ display: "flex", justifyContent: "center", margin: "20px 0 0" }}>
          <div className="status-badge">
            <span className="status-dot" />
            Online & Siap
          </div>
        </div>

        {/* Logout */}
        <button
          id="logout-btn"
          onClick={handleLogout}
          style={{
            marginTop: 20, background: "transparent", border: "none",
            color: "#475569", fontSize: "0.8rem", cursor: "pointer",
            transition: "color 0.2s", padding: "8px 16px", borderRadius: 8,
            fontFamily: "Inter, sans-serif"
          }}
          onMouseEnter={e => e.target.style.color = "#ef4444"}
          onMouseLeave={e => e.target.style.color = "#475569"}
        >
          Keluar
        </button>
      </div>
    </div>
  );
}
