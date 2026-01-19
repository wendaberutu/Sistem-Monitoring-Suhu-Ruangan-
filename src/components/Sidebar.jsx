import { Sidebar, Menu, MenuItem } from "react-pro-sidebar";
import { useNavigate, useLocation } from "react-router-dom";
import logo from "../assets/logo_waleta3.png";

const MENU = [
  { path: "/rooms", label: "Suhu & Kelembapan", icon: "🌡️" },
  { path: "/water", label: "Water Treatment", icon: "💧" },
  { path: "/energy", label: "Konsumsi Energi", icon: "⚡" },
];

export default function AppSidebar({ collapsed, onToggle }) {
  const navigate = useNavigate();
  const { pathname } = useLocation();

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
        {MENU.map(m => (
          <MenuItem
            key={m.path}
            active={pathname === m.path}
            icon={m.icon}
            onClick={() => navigate(m.path)}
          >
            {m.label}
          </MenuItem>
        ))}
      </Menu>
    </Sidebar>
  );
}
