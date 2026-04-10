export default function CallingScreen({ onCancel }) {
  return (
    <div className="grid-bg" style={{
      position: "fixed", inset: 0,
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      zIndex: 50,
    }}>
      {/* Background orbs */}
      <div className="bg-orbs">
        <div className="bg-orb bg-orb-1" />
        <div className="bg-orb bg-orb-2" />
        <div className="bg-orb bg-orb-3" />
      </div>

      {/* Scan line */}
      <div style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none" }}>
        <div className="scan-line" />
      </div>

      <div className="animate-fade-up" style={{ textAlign: "center", position: "relative", zIndex: 1, display: "flex", flexDirection: "column", alignItems: "center" }}>
        {/* Logo mark */}
        <div style={{ marginBottom: 8 }}>
          <span style={{ fontSize: "0.65rem", fontWeight: 600, letterSpacing: "0.3em", textTransform: "uppercase", color: "#a78bfa" }}>
            ✦ VOICE CONNECT
          </span>
        </div>

        {/* Avatar with pulse rings */}
        <div className="pulse-rings" style={{ marginBottom: 36, marginTop: 12 }}>
          <div className="pulse-ring pulse-ring-1" />
          <div className="pulse-ring pulse-ring-2" />
          <div className="pulse-ring pulse-ring-3" />

          {/* Center avatar */}
          <div className="avatar-ring" style={{ width: 80, height: 80, position: "relative", zIndex: 2 }}>
            <div style={{
              width: 80, height: 80, borderRadius: "50%",
              background: "linear-gradient(135deg, rgba(124,58,237,0.4), rgba(59,130,246,0.3))",
              display: "flex", alignItems: "center", justifyContent: "center",
              backdropFilter: "blur(16px)",
            }}>
              <svg width="36" height="36" fill="none" viewBox="0 0 24 24">
                <defs>
                  <linearGradient id="callingIcon" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#c084fc" />
                    <stop offset="100%" stopColor="#60a5fa" />
                  </linearGradient>
                </defs>
                <path fill="url(#callingIcon)" d="M20.01 15.38c-1.23 0-2.42-.2-3.53-.56a.977.977 0 0 0-1.01.24l-1.57 1.97c-2.83-1.35-5.48-3.9-6.89-6.83l1.95-1.66c.27-.28.35-.67.24-1.02-.37-1.11-.56-2.3-.56-3.53 0-.54-.45-.99-.99-.99H4.19C3.65 3 3 3.24 3 3.99 3 13.28 10.73 21 20.01 21c.71 0 .99-.63.99-1.18v-3.45c0-.54-.45-.99-.99-.99z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Text */}
        <h2 style={{ fontSize: "1.5rem", fontWeight: 700, marginBottom: 8, background: "linear-gradient(135deg, #f1f5f9, #94a3b8)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
          Command Center
        </h2>

        {/* Animated calling dots */}
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 48, color: "#a78bfa", fontSize: "0.9rem", fontWeight: 500 }}>
          <span>Memanggil</span>
          <div className="calling-dots" style={{ display: "flex", gap: 3 }}>
            <span style={{ color: "#a78bfa", fontWeight: 700 }}>•</span>
            <span style={{ color: "#a78bfa", fontWeight: 700 }}>•</span>
            <span style={{ color: "#a78bfa", fontWeight: 700 }}>•</span>
          </div>
        </div>

        {/* Cancel button */}
        <button
          id="cancel-call-btn"
          onClick={onCancel}
          className="call-btn call-btn-end"
          style={{ marginBottom: 16 }}
        >
          <svg width="28" height="28" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 9c-1.6 0-3.15.25-4.6.72v3.1c0 .39-.23.74-.56.9-.98.49-1.87 1.12-2.66 1.85-.18.18-.43.28-.7.28-.28 0-.53-.11-.71-.29L.29 13.08a.956.956 0 0 1-.29-.7c0-.28.11-.53.29-.71C3.34 8.78 7.46 7 12 7s8.66 1.78 11.71 4.67c.18.18.29.43.29.71 0 .28-.11.53-.29.71l-2.48 2.48c-.18.18-.43.29-.71.29-.27 0-.52-.11-.7-.28a11.27 11.27 0 0 0-2.67-1.85.996.996 0 0 1-.56-.9v-3.1C15.15 9.25 13.6 9 12 9z" />
          </svg>
        </button>
        <p style={{ color: "#475569", fontSize: "0.75rem" }}>Batalkan Panggilan</p>
      </div>
    </div>
  );
}
