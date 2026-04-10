export default function IncomingCallModal({ callerId, callerName, onAccept, onReject }) {
  const displayName = callerName || callerId;

  return (
    <div className="animate-fade-in" style={{
      position: "fixed", inset: 0,
      background: "rgba(5,8,20,0.85)",
      backdropFilter: "blur(16px)",
      WebkitBackdropFilter: "blur(16px)",
      zIndex: 50,
      display: "flex",
      alignItems: "flex-end",
      justifyContent: "center",
      padding: "0 16px 24px",
    }}>
      {/* Modal card */}
      <div className="glass-card animate-slide-up" style={{
        width: "100%", maxWidth: 400,
        padding: "28px 24px 24px",
        background: "rgba(14,20,40,0.9)",
        border: "1px solid rgba(14,165,233,0.15)",
        boxShadow: "0 0 60px rgba(14,165,233,0.12), 0 32px 64px rgba(0,0,0,0.7)",
        position: "relative",
        overflow: "hidden",
      }}>
        {/* Top glow line */}
        <div style={{
          position: "absolute", top: 0, left: "20%", right: "20%", height: 1,
          background: "linear-gradient(90deg, transparent, rgba(14,165,233,0.6), transparent)",
        }} />

        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 20 }}>
          <span style={{ fontSize: "0.62rem", fontWeight: 700, letterSpacing: "0.25em", textTransform: "uppercase", color: "#38bdf8" }}>
            ✦ Panggilan Masuk
          </span>
        </div>

        {/* Caller avatar + pulse rings */}
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 20 }}>
          <div className="pulse-rings">
            <div className="pulse-ring pulse-ring-1" />
            <div className="pulse-ring pulse-ring-2" />

            <div className="avatar-ring" style={{ width: 72, height: 72, position: "relative", zIndex: 2 }}>
              <div style={{
                width: 72, height: 72, borderRadius: "50%",
                background: "linear-gradient(135deg, rgba(14,165,233,0.3), rgba(124,58,237,0.25))",
                display: "flex", alignItems: "center", justifyContent: "center",
                backdropFilter: "blur(12px)",
              }}>
                <svg width="32" height="32" fill="none" viewBox="0 0 24 24">
                  <defs>
                    <linearGradient id="modalAvatar" x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0%" stopColor="#38bdf8" />
                      <stop offset="100%" stopColor="#a78bfa" />
                    </linearGradient>
                  </defs>
                  <path fill="url(#modalAvatar)" d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Caller info */}
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <h3 style={{
            fontSize: "1.3rem", fontWeight: 800, margin: "0 0 4px",
            background: "linear-gradient(135deg, #f1f5f9, #94a3b8)",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}>
            {displayName}
          </h3>
          {callerName && (
            <p style={{ color: "#334155", fontSize: "0.68rem", fontFamily: "monospace", margin: 0 }}>
              {callerId}
            </p>
          )}
        </div>

        {/* Divider */}
        <div style={{ height: 1, background: "rgba(255,255,255,0.05)", marginBottom: 20 }} />

        {/* Action buttons */}
        <div style={{ display: "flex", gap: 12 }}>
          {/* Reject */}
          <button
            id="reject-call-btn"
            onClick={onReject}
            style={{
              flex: 1,
              display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
              background: "rgba(239,68,68,0.1)",
              border: "1px solid rgba(239,68,68,0.25)",
              borderRadius: 14, color: "#f87171",
              fontFamily: "Inter, sans-serif", fontWeight: 700,
              fontSize: "0.9rem", padding: "13px 16px",
              cursor: "pointer",
              transition: "all 0.2s",
            }}
            onMouseEnter={e => { e.currentTarget.style.background = "rgba(239,68,68,0.2)"; e.currentTarget.style.boxShadow = "0 0 20px rgba(239,68,68,0.2)"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "rgba(239,68,68,0.1)"; e.currentTarget.style.boxShadow = "none"; }}
          >
            <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 9c-1.6 0-3.15.25-4.6.72v3.1c0 .39-.23.74-.56.9-.98.49-1.87 1.12-2.66 1.85-.18.18-.43.28-.7.28-.28 0-.53-.11-.71-.29L.29 13.08a.956.956 0 0 1-.29-.7c0-.28.11-.53.29-.71C3.34 8.78 7.46 7 12 7s8.66 1.78 11.71 4.67c.18.18.29.43.29.71 0 .28-.11.53-.29.71l-2.48 2.48c-.18.18-.43.29-.71.29-.27 0-.52-.11-.7-.28a11.27 11.27 0 0 0-2.67-1.85.996.996 0 0 1-.56-.9v-3.1C15.15 9.25 13.6 9 12 9z" />
            </svg>
            Tolak
          </button>

          {/* Accept */}
          <button
            id="accept-call-btn"
            onClick={onAccept}
            style={{
              flex: 1,
              display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
              background: "linear-gradient(135deg, #059669, #0891b2)",
              border: "none", borderRadius: 14,
              color: "white", fontFamily: "Inter, sans-serif",
              fontWeight: 700, fontSize: "0.9rem", padding: "13px 16px",
              cursor: "pointer",
              boxShadow: "0 0 24px rgba(16,185,129,0.35), 0 8px 20px rgba(0,0,0,0.3)",
              transition: "all 0.2s",
            }}
            onMouseEnter={e => { e.currentTarget.style.boxShadow = "0 0 40px rgba(16,185,129,0.55), 0 12px 24px rgba(0,0,0,0.4)"; e.currentTarget.style.transform = "translateY(-1px)"; }}
            onMouseLeave={e => { e.currentTarget.style.boxShadow = "0 0 24px rgba(16,185,129,0.35), 0 8px 20px rgba(0,0,0,0.3)"; e.currentTarget.style.transform = "none"; }}
          >
            <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24">
              <path d="M20.01 15.38c-1.23 0-2.42-.2-3.53-.56a.977.977 0 0 0-1.01.24l-1.57 1.97c-2.83-1.35-5.48-3.9-6.89-6.83l1.95-1.66c.27-.28.35-.67.24-1.02-.37-1.11-.56-2.3-.56-3.53 0-.54-.45-.99-.99-.99H4.19C3.65 3 3 3.24 3 3.99 3 13.28 10.73 21 20.01 21c.71 0 .99-.63.99-1.18v-3.45c0-.54-.45-.99-.99-.99z" />
            </svg>
            Terima
          </button>
        </div>
      </div>
    </div>
  );
}
