import { useState } from "react";

export default function OperatorLoginPage({ onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async (e) => {
    e?.preventDefault();
    if (!username.trim() || !password.trim()) return;
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: username.trim(), password: password.trim() }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Login gagal");
        setLoading(false);
        return;
      }

      const account = await res.json();

      if (account.role !== "operator") {
        setError("Akun ini bukan akun operator");
        setLoading(false);
        return;
      }

      onLogin(account);
    } catch (err) {
      console.error("Login failed:", err);
      setError("Tidak dapat terhubung ke server");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="grid-bg"
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "16px",
        position: "relative",
      }}
    >
      <div className="bg-orbs">
        <div className="bg-orb bg-orb-1" />
        <div className="bg-orb bg-orb-2" />
        <div className="bg-orb bg-orb-3" />
      </div>

      {/* Scan line */}
      <div style={{ position: "fixed", inset: 0, overflow: "hidden", pointerEvents: "none", zIndex: 0 }}>
        <div className="scan-line" />
      </div>

      <div
        className="glass-card animate-fade-up"
        style={{
          width: "100%",
          maxWidth: 440,
          padding: "40px 36px",
          textAlign: "center",
          position: "relative",
          zIndex: 1,
        }}
      >
        {/* Logo */}
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 28 }}>
          <div className="avatar-ring" style={{ width: 80, height: 80 }}>
            <div
              style={{
                width: 80,
                height: 80,
                borderRadius: "50%",
                background: "linear-gradient(135deg, rgba(14,165,233,0.3), rgba(124,58,237,0.2))",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                backdropFilter: "blur(10px)",
              }}
            >
              <svg width="36" height="36" fill="none" viewBox="0 0 24 24">
                <defs>
                  <linearGradient id="opLoginIcon" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#38bdf8" />
                    <stop offset="100%" stopColor="#a78bfa" />
                  </linearGradient>
                </defs>
                <path
                  fill="url(#opLoginIcon)"
                  d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* Title */}
        <div style={{ marginBottom: 6 }}>
          <span
            style={{
              fontSize: "0.65rem",
              fontWeight: 700,
              letterSpacing: "0.25em",
              textTransform: "uppercase",
              color: "#38bdf8",
            }}
          >
            ✦ SISTEM KOMUNIKASI
          </span>
        </div>
        <h1
          style={{
            fontSize: "1.75rem",
            fontWeight: 800,
            marginBottom: 6,
            lineHeight: 1.2,
            background: "linear-gradient(135deg, #f1f5f9, #94a3b8)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}
        >
          Command Center
        </h1>
        <p style={{ color: "#64748b", fontSize: "0.85rem", marginBottom: 28 }}>
          Login sebagai operator untuk memulai sesi
        </p>

        {/* Error */}
        {error && (
          <div
            className="animate-fade-in"
            style={{
              background: "rgba(239, 68, 68, 0.1)",
              border: "1px solid rgba(239, 68, 68, 0.25)",
              borderRadius: 12,
              padding: "10px 16px",
              marginBottom: 16,
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <svg width="16" height="16" fill="#ef4444" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
            </svg>
            <span style={{ color: "#f87171", fontSize: "0.8rem", fontWeight: 500 }}>{error}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleLogin}>
          <div style={{ position: "relative", marginBottom: 12 }}>
            <div
              style={{
                position: "absolute",
                left: 16,
                top: "50%",
                transform: "translateY(-50%)",
                color: "#64748b",
                display: "flex",
                alignItems: "center",
              }}
            >
              <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
              </svg>
            </div>
            <input
              id="operator-username-input"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Username operator"
              className="input-glass"
              autoFocus
              autoComplete="username"
              style={{ paddingLeft: 44, textAlign: "left" }}
            />
          </div>

          <div style={{ position: "relative", marginBottom: 20 }}>
            <div
              style={{
                position: "absolute",
                left: 16,
                top: "50%",
                transform: "translateY(-50%)",
                color: "#64748b",
                display: "flex",
                alignItems: "center",
              }}
            >
              <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zM12 17c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1s3.1 1.39 3.1 3.1v2z" />
              </svg>
            </div>
            <input
              id="operator-password-input"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="input-glass"
              autoComplete="current-password"
              style={{ paddingLeft: 44, paddingRight: 44, textAlign: "left" }}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              style={{
                position: "absolute",
                right: 12,
                top: "50%",
                transform: "translateY(-50%)",
                background: "none",
                border: "none",
                cursor: "pointer",
                color: "#64748b",
                display: "flex",
                alignItems: "center",
                padding: 4,
              }}
            >
              {showPassword ? (
                <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 7c2.76 0 5 2.24 5 5 0 .65-.13 1.26-.36 1.83l2.92 2.92c1.51-1.26 2.7-2.89 3.43-4.75-1.73-4.39-6-7.5-11-7.5-1.4 0-2.74.25-3.98.7l2.16 2.16C10.74 7.13 11.35 7 12 7zM2 4.27l2.28 2.28.46.46C3.08 8.3 1.78 10.02 1 12c1.73 4.39 6 7.5 11 7.5 1.55 0 3.03-.3 4.38-.84l.42.42L19.73 22 21 20.73 3.27 3 2 4.27zM7.53 9.8l1.55 1.55c-.05.21-.08.43-.08.65 0 1.66 1.34 3 3 3 .22 0 .44-.03.65-.08l1.55 1.55c-.67.33-1.41.53-2.2.53-2.76 0-5-2.24-5-5 0-.79.2-1.53.53-2.2zm4.31-.78l3.15 3.15.02-.16c0-1.66-1.34-3-3-3l-.17.01z" />
                </svg>
              ) : (
                <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" />
                </svg>
              )}
            </button>
          </div>

          {/* Login Button */}
          <button
            id="operator-login-btn"
            type="submit"
            disabled={!username.trim() || !password.trim() || loading}
            className="btn-neon btn-neon-cyan"
            style={{ width: "100%", fontSize: "1rem", padding: "14px 24px" }}
          >
            <span
              style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}
            >
              {loading ? (
                <>
                  <div
                    style={{
                      width: 18,
                      height: 18,
                      borderRadius: "50%",
                      border: "2px solid rgba(255,255,255,0.3)",
                      borderTop: "2px solid white",
                      animation: "spin-ring 0.8s linear infinite",
                    }}
                  />
                  Masuk...
                </>
              ) : (
                <>
                  <svg width="18" height="18" fill="none" viewBox="0 0 24 24">
                    <path
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z"
                    />
                  </svg>
                  Masuk Sebagai Operator
                </>
              )}
            </span>
          </button>
        </form>

        {/* Credentials hint */}
        <div
          style={{
            marginTop: 24,
            padding: "14px 16px",
            background: "rgba(14, 165, 233, 0.06)",
            border: "1px solid rgba(14, 165, 233, 0.12)",
            borderRadius: 14,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
            <svg width="14" height="14" fill="#38bdf8" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z" />
            </svg>
            <span style={{ color: "#38bdf8", fontSize: "0.72rem", fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase" }}>
              Kredensial Operator
            </span>
          </div>
          <div style={{ display: "flex", gap: 16, justifyContent: "center" }}>
            <div>
              <span style={{ color: "#475569", fontSize: "0.7rem" }}>Username: </span>
              <span style={{ color: "#94a3b8", fontSize: "0.78rem", fontWeight: 600, fontFamily: "monospace" }}>operator</span>
            </div>
            <div>
              <span style={{ color: "#475569", fontSize: "0.7rem" }}>Password: </span>
              <span style={{ color: "#94a3b8", fontSize: "0.78rem", fontWeight: 600, fontFamily: "monospace" }}>admin123</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
