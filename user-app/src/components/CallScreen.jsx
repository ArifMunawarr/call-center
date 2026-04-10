import { useEffect, useState, useRef } from "react";
import { joinChannel, leaveChannel, toggleMute } from "../services/agora";
import socket from "../services/socket";

export default function CallScreen({ channelName, userId, onEnd }) {
  const [muted, setMuted] = useState(false);
  const [duration, setDuration] = useState(0);
  const timerRef = useRef(null);

  useEffect(() => {
    const uid = Math.floor(Math.random() * 100000);
    joinChannel(channelName, uid).catch(console.error);
    timerRef.current = setInterval(() => setDuration((prev) => prev + 1), 1000);
    const handleCallEnded = () => handleEnd();
    socket.on("call-ended", handleCallEnded);
    return () => {
      socket.off("call-ended", handleCallEnded);
      clearInterval(timerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleEnd = async () => {
    clearInterval(timerRef.current);
    socket.emit("end-call", { channelName, userId });
    await leaveChannel();
    onEnd();
  };

  const handleMute = () => {
    const newMuted = !muted;
    setMuted(newMuted);
    toggleMute(newMuted);
  };

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60).toString().padStart(2, "0");
    const s = (secs % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  return (
    <div className="grid-bg" style={{
      position: "fixed", inset: 0,
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      zIndex: 50,
    }}>
      {/* Orbs */}
      <div className="bg-orbs">
        <div className="bg-orb bg-orb-1" style={{ opacity: 0.1 }} />
        <div className="bg-orb bg-orb-2" style={{ opacity: 0.1 }} />
        <div className="bg-orb" style={{
          width: 500, height: 500,
          background: "radial-gradient(circle, #059669, transparent 70%)",
          top: "50%", left: "50%",
          transform: "translate(-50%, -50%)",
          opacity: 0.07,
          animation: "orb-float 6s ease-in-out infinite"
        }} />
      </div>

      <div className="animate-fade-up" style={{ textAlign: "center", position: "relative", zIndex: 1, display: "flex", flexDirection: "column", alignItems: "center", width: "100%", maxWidth: 400, padding: "0 24px" }}>

        {/* Connected badge */}
        <div style={{ marginBottom: 32 }}>
          <div className="status-badge" style={{ background: "rgba(16,185,129,0.12)", borderColor: "rgba(16,185,129,0.25)", color: "#34d399" }}>
            <span className="status-dot" />
            Terhubung
          </div>
        </div>

        {/* Avatar */}
        <div className="avatar-ring" style={{ width: 100, height: 100, marginBottom: 20 }}>
          <div style={{
            width: 100, height: 100, borderRadius: "50%",
            background: "linear-gradient(135deg, rgba(16,185,129,0.3), rgba(6,182,212,0.2))",
            display: "flex", alignItems: "center", justifyContent: "center",
            backdropFilter: "blur(16px)",
          }}>
            <svg width="44" height="44" fill="none" viewBox="0 0 24 24">
              <defs>
                <linearGradient id="ccIcon" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#34d399" />
                  <stop offset="100%" stopColor="#22d3ee" />
                </linearGradient>
              </defs>
              <path fill="url(#ccIcon)" d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z" />
            </svg>
          </div>
        </div>

        {/* Name */}
        <h2 style={{
          fontSize: "1.5rem", fontWeight: 700, marginBottom: 16,
          background: "linear-gradient(135deg, #f1f5f9, #94a3b8)",
          WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
          backgroundClip: "text"
        }}>
          Command Center
        </h2>

        {/* Timer */}
        <div className="timer-display" style={{ marginBottom: 40 }}>
          {formatTime(duration)}
        </div>

        {/* Waveform visual */}
        <div style={{
          display: "flex", alignItems: "center", gap: 4, marginBottom: 44, height: 40
        }}>
          {[0.4, 0.7, 1, 0.6, 0.9, 0.5, 0.8, 1, 0.7, 0.4, 0.6, 0.9, 0.5, 0.8].map((h, i) => (
            <div
              key={i}
              style={{
                width: 4,
                height: `${h * 36}px`,
                borderRadius: 4,
                background: muted
                  ? "rgba(239,68,68,0.4)"
                  : `linear-gradient(to top, #10b981, #06b6d4)`,
                animation: !muted ? `dot-bounce ${0.8 + Math.random() * 0.6}s ease-in-out infinite` : "none",
                animationDelay: `${i * 0.07}s`,
                opacity: muted ? 0.3 : 0.8,
                transition: "all 0.3s",
              }}
            />
          ))}
        </div>

        {/* Controls */}
        <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
          {/* Mute */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
            <button
              id="mute-btn"
              onClick={handleMute}
              className={`call-btn call-btn-mute ${muted ? "active" : ""}`}
            >
              {muted ? (
                <svg width="24" height="24" fill="currentColor" viewBox="0 0 24 24" style={{ color: "#ef4444" }}>
                  <path d="M19 11h-1.7c0 .74-.16 1.43-.43 2.05l1.23 1.23c.56-.98.9-2.09.9-3.28zm-4.02.17c0-.06.02-.11.02-.17V5c0-1.66-1.34-3-3-3S9 3.34 9 5v.18l5.98 5.99zM4.27 3L3 4.27l6.01 6.01V11c0 1.66 1.33 3 2.99 3 .22 0 .44-.03.65-.08l1.66 1.66c-.71.33-1.5.52-2.31.52-2.76 0-5.3-2.1-5.3-5.1H5c0 3.41 2.72 6.23 6 6.72V21h2v-3.28c.91-.13 1.77-.45 2.54-.9L19.73 21 21 19.73 4.27 3z" />
                </svg>
              ) : (
                <svg width="24" height="24" fill="currentColor" viewBox="0 0 24 24" style={{ color: "#94a3b8" }}>
                  <path d="M12 14c1.66 0 2.99-1.34 2.99-3L15 5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm5.3-3c0 3-2.54 5.1-5.3 5.1S6.7 14 6.7 11H5c0 3.41 2.72 6.23 6 6.72V21h2v-3.28c3.28-.48 6-3.3 6-6.72h-1.7z" />
                </svg>
              )}
            </button>
            <span style={{ fontSize: "0.7rem", color: muted ? "#ef4444" : "#475569", transition: "color 0.3s" }}>
              {muted ? "Bisu" : "Mikrofon"}
            </span>
          </div>

          {/* End Call */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
            <button
              id="end-call-btn"
              onClick={handleEnd}
              className="call-btn call-btn-end"
            >
              <svg width="28" height="28" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 9c-1.6 0-3.15.25-4.6.72v3.1c0 .39-.23.74-.56.9-.98.49-1.87 1.12-2.66 1.85-.18.18-.43.28-.7.28-.28 0-.53-.11-.71-.29L.29 13.08a.956.956 0 0 1-.29-.7c0-.28.11-.53.29-.71C3.34 8.78 7.46 7 12 7s8.66 1.78 11.71 4.67c.18.18.29.43.29.71 0 .28-.11.53-.29.71l-2.48 2.48c-.18.18-.43.29-.71.29-.27 0-.52-.11-.7-.28a11.27 11.27 0 0 0-2.67-1.85.996.996 0 0 1-.56-.9v-3.1C15.15 9.25 13.6 9 12 9z" />
              </svg>
            </button>
            <span style={{ fontSize: "0.7rem", color: "#ef4444" }}>Tutup</span>
          </div>
        </div>
      </div>
    </div>
  );
}
