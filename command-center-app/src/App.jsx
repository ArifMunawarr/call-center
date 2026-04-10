import { useState, useEffect } from "react";
import Dashboard from "./components/Dashboard";
import OperatorLoginPage from "./components/OperatorLoginPage";

function App() {
  const [operator, setOperator] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function restore() {
      const saved = sessionStorage.getItem("operator_session");
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          const res = await fetch(`/api/auth/verify/${parsed.id}`);
          if (res.ok) {
            const account = await res.json();
            if (account.role === "operator") {
              setOperator(account);
              setLoading(false);
              return;
            }
          }
        } catch { /* fall through */ }
        sessionStorage.removeItem("operator_session");
      }
      setLoading(false);
    }
    restore();
  }, []);

  const handleLogin = (account) => {
    setOperator(account);
    sessionStorage.setItem("operator_session", JSON.stringify(account));
  };

  const handleLogout = () => {
    sessionStorage.removeItem("operator_session");
    sessionStorage.removeItem("operator_id");
    setOperator(null);
  };

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
            border: "3px solid rgba(14,165,233,0.3)",
            borderTop: "3px solid #0ea5e9",
            animation: "spin-ring 1s linear infinite",
            margin: "0 auto 16px"
          }} />
          <p style={{ color: "#94a3b8", fontSize: "0.875rem" }}>Loading...</p>
        </div>
      </div>
    );
  }

  if (!operator) {
    return <OperatorLoginPage onLogin={handleLogin} />;
  }

  return <Dashboard operator={operator} onLogout={handleLogout} />;
}

export default App;
