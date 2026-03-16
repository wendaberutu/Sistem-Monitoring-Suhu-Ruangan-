import { Sidebar, Menu, MenuItem } from "react-pro-sidebar";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import logo from "../assets/logo_waleta3.png";

const MENU = [
  { path: "/rooms", adminPath: "/admin/room-monitoring", label: "Suhu & Kelembapan", icon: "🌡️" },
  { path: "/water", label: "Water Treatment", icon: "💧" },
  { path: "/energy", label: "Konsumsi Energi", icon: "⚡" },
];

export default function AppSidebar({ collapsed, onToggle }) {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { user } = useAuth();
  const isAdmin = !!user?.permissions?.admin;

  return (
    <Sidebar
      collapsed={collapsed}
      width="220px"
      collapsedWidth="64px"
      backgroundColor="#020617"
      rootStyles={{
        height: "100vh",
        borderRight: "1px solid #1e293b",
      }}
    >
      {/* HEADER SIDEBAR (LOGO = TOGGLE) */}
      <div
        onClick={onToggle}
        style={{
          cursor: "pointer",
          padding: "16px",
          borderBottom: "1px solid #1e293b",
          display: "flex",
          alignItems: "center",
          gap: "10px",
        }}
      >
        <img src={logo} alt="Waleta" style={{ height: "28px" }} />
        {!collapsed && (
          <div style={{ color: "#e5e7eb", lineHeight: 1.2 }}>
            <div style={{ fontWeight: 700 }}>WALETA</div>
            <div style={{ fontSize: "12px", opacity: 0.7 }}>
              Sistem Monitoring
            </div>
          </div>
        )}
      </div>

      {/* MENU */}
      <Menu
        menuItemStyles={{
          button: ({ active }) => ({
            color: "#e5e7eb",
            backgroundColor: active ? "#1e293b" : "transparent",
            fontSize: "14px",
            "&:hover": { backgroundColor: "#1e293b" },
          }),
        }}
      >
        {MENU.map(m => {
          const targetPath = (isAdmin && m.adminPath) ? m.adminPath : m.path;
          return (
            <MenuItem
              key={m.path}
              active={pathname === targetPath}
              icon={m.icon}
              onClick={() => navigate(targetPath)}
            >
              {m.label}
            </MenuItem>
          );
        })}
      </Menu>

      {/* TOMBOL KEMBALI KE ADMIN (hanya admin, di bawah) */}
      {isAdmin && (
        <div
          style={{
            position: "absolute",
            bottom: 0,
            width: "100%",
            borderTop: "1px solid #1e293b",
            padding: "12px 8px",
          }}
        >
          <button
            onClick={() => navigate("/admin")}
            title="Kembali ke Admin"
            style={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              gap: "10px",
              padding: "8px 12px",
              background: "transparent",
              border: "none",
              cursor: "pointer",
              color: "#94a3b8",
              fontSize: "13px",
              borderRadius: "6px",
              transition: "background 0.2s, color 0.2s",
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = "#1e293b";
              e.currentTarget.style.color = "#ef4444";
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = "transparent";
              e.currentTarget.style.color = "#94a3b8";
            }}
          >
            <span style={{ fontSize: "16px" }}>🔙</span>
            {!collapsed && <span>Kembali ke Admin</span>}
          </button>
        </div>
      )}
    </Sidebar>
  );
}
