import { useState } from "react";

export default function LoginPage({ onLogin }) {
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

      if (account.role !== "user") {
        setError("Akun ini bukan akun pengguna");
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

  const accounts = [
    { username: "user1", name: "Ahmad Fauzi" },
    { username: "user2", name: "Siti Nurhaliza" },
    { username: "user3", name: "Budi Santoso" },
  ];

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
                background: "linear-gradient(135deg, rgba(124,58,237,0.3), rgba(59,130,246,0.3))",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                backdropFilter: "blur(10px)",
              }}
            >
              <svg width="36" height="36" fill="none" viewBox="0 0 24 24">
                <defs>
                  <linearGradient id="loginIcon" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#a855f7" />
                    <stop offset="100%" stopColor="#3b82f6" />
                  </linearGradient>
                </defs>
                <path
                  fill="url(#loginIcon)"
                  d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* Title */}
        <div style={{ marginBottom: 6 }}>
          <span
            style={{
              fontSize: "0.7rem",
              fontWeight: 600,
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              color: "#a78bfa",
            }}
          >
            ✦ Voice Connect
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
          Login Pengguna
        </h1>
        <p style={{ color: "#64748b", fontSize: "0.85rem", marginBottom: 28 }}>
          Masuk dengan akun Anda untuk memulai panggilan
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
              id="username-input"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Username"
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
              id="password-input"
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
            id="login-btn"
            type="submit"
            disabled={!username.trim() || !password.trim() || loading}
            className="btn-neon"
            style={{ width: "100%", fontSize: "1rem", padding: "14px 24px", marginBottom: 4 }}
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
                      d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4M10 17l5-5-5-5M15 12H3"
                    />
                  </svg>
                  Masuk
                </>
              )}
            </span>
          </button>
        </form>

        {/* Divider */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            margin: "24px 0 20px",
          }}
        >
          <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.06)" }} />
          <span style={{ color: "#475569", fontSize: "0.7rem", fontWeight: 500, letterSpacing: "0.1em", textTransform: "uppercase" }}>
            Akun Tersedia
          </span>
          <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.06)" }} />
        </div>

        {/* Account Cards */}
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {accounts.map((acc, i) => (
            <button
              key={acc.username}
              id={`quick-login-${acc.username}`}
              onClick={() => {
                setUsername(acc.username);
                setPassword("password123");
                setError("");
              }}
              className="account-card"
              style={{
                animationDelay: `${0.1 + i * 0.08}s`,
              }}
            >
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: "50%",
                  background: `linear-gradient(135deg, ${
                    ["rgba(168,85,247,0.25)", "rgba(59,130,246,0.25)", "rgba(16,185,129,0.25)"][i]
                  }, ${
                    ["rgba(59,130,246,0.15)", "rgba(6,182,212,0.15)", "rgba(234,179,8,0.15)"][i]
                  })`,
                  border: `1px solid ${
                    ["rgba(168,85,247,0.2)", "rgba(59,130,246,0.2)", "rgba(16,185,129,0.2)"][i]
                  }`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "0.85rem",
                  fontWeight: 700,
                  color: ["#a855f7", "#3b82f6", "#10b981"][i],
                  flexShrink: 0,
                }}
              >
                {acc.name.charAt(0)}
              </div>
              <div style={{ flex: 1, textAlign: "left", minWidth: 0 }}>
                <p
                  style={{
                    margin: 0,
                    fontSize: "0.85rem",
                    fontWeight: 600,
                    color: "#e2e8f0",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {acc.name}
                </p>
                <p style={{ margin: 0, fontSize: "0.72rem", color: "#64748b" }}>@{acc.username}</p>
              </div>
              <svg
                width="16"
                height="16"
                fill="none"
                viewBox="0 0 24 24"
                style={{ color: "#475569", flexShrink: 0 }}
              >
                <path
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 18l6-6-6-6"
                />
              </svg>
            </button>
          ))}
        </div>

        {/* Password hint */}
        <p
          style={{
            color: "#334155",
            fontSize: "0.68rem",
            marginTop: 16,
            marginBottom: 0,
            fontStyle: "italic",
          }}
        >
          Password default: password123
        </p>
      </div>
    </div>
  );
}
