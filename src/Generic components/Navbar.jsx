import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const profileMenuRef = useRef(null);

  const currentUser = JSON.parse(localStorage.getItem("currentuser")) || null;

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
        setShowProfileMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header style={{ background: "#0f172a", borderBottom: "1px solid #1e293b", padding: "8px 16px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "8px" }}>
        <div
          onClick={() => navigate("/")}
          style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer" }}
        >
          <div style={{ width: "30px", height: "30px", borderRadius: "8px", background: "#3b82f6", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "16px", color: "#fff" }}>
            🏋️‍♂️
          </div>
          <span style={{ fontSize: "16px", fontWeight: 800, color: "#fff", letterSpacing: "-0.4px" }}>
            Gym<span style={{ color: "#3b82f6" }}>Sphere</span>
          </span>
        </div>

        <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
          <button
            onClick={() => navigate("/superadmin")}
            style={{
              background: location.pathname === "/superadmin" ? "#3b82f6" : "#1e293b",
              color: "#fff", border: "1px solid #334155", padding: "4px 10px", borderRadius: "6px", fontSize: "11px", fontWeight: 600, cursor: "pointer",
            }}
          >
            🛡️ SuperAdmin
          </button>

          <button
            onClick={() => navigate("/admin")}
            style={{
              background: location.pathname === "/admin" ? "#3b82f6" : "#1e293b",
              color: "#fff", border: "1px solid #334155", padding: "4px 10px", borderRadius: "6px", fontSize: "11px", fontWeight: 600, cursor: "pointer",
            }}
          >
            💼 Admin
          </button>

          <button
            onClick={() => navigate("/manager")}
            style={{
              background: location.pathname === "/manager" ? "#10b981" : "#1e293b",
              color: "#fff", border: "1px solid #334155", padding: "4px 10px", borderRadius: "6px", fontSize: "11px", fontWeight: 600, cursor: "pointer",
            }}
          >
            🛠️ Gym Manager
          </button>

          <button
            onClick={() => navigate("/trainer")}
            style={{
              background: location.pathname === "/trainer" ? "#aa3bff" : "#1e293b",
              color: "#fff", border: "1px solid #334155", padding: "4px 10px", borderRadius: "6px", fontSize: "11px", fontWeight: 600, cursor: "pointer",
            }}
          >
            💪 Trainer
          </button>

          <button
            onClick={() => navigate("/user")}
            style={{
              background: location.pathname === "/user" ? "#f59e0b" : "#1e293b",
              color: "#fff", border: "1px solid #334155", padding: "4px 10px", borderRadius: "6px", fontSize: "11px", fontWeight: 600, cursor: "pointer",
            }}
          >
            🔥 Member Hub
          </button>
        </div>

        <div>
          {currentUser ? (
            <button
              onClick={() => {
                localStorage.removeItem("token");
                localStorage.removeItem("currentuser");
                navigate("/");
              }}
              style={{ background: "#ef4444", color: "#fff", border: "none", padding: "4px 10px", borderRadius: "6px", fontSize: "11px", fontWeight: 600, cursor: "pointer" }}
            >
              🚪 Logout
            </button>
          ) : (
            <button
              onClick={() => navigate("/login")}
              style={{ background: "#3b82f6", color: "#fff", border: "none", padding: "4px 12px", borderRadius: "6px", fontSize: "11px", fontWeight: 600, cursor: "pointer" }}
            >
              Login
            </button>
          )}
        </div>
      </div>
    </header>
  );
}

export default Navbar;
