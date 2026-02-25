import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import logo from "../assets/logo_waleta3.png";

const menuByRole = {
  admin: [
    { label: "Dashboard", to: "/admin", icon: "📊" },
    { label: "Inventori", to: "/admin/inventory", icon: "📦" },
    { label: "Penerimaan Servis", to: "/admin/penerimaan-service", icon: "🛠️" },
  ],
  technician: [
    { label: "Dashboard", to: "/technician", icon: "📊" },
    { label: "klaim Tugas", to: "/technician/claim", icon: "📋" },
    { label: "Tugas Saya", to: "/technician/jobs", icon: "🛠️" },
    { label: "Riwayat Pekerjaan", to: "/technician/history", icon: "📜" },
  ],
  verifier: [
    { label: "Dashboard", to: "/verify", icon: "📊" },
    { label: "Verifikasi Pekerjaan", to: "/verify/tasks", icon: "✅" },
    { label: "Riwayat Verifikasi", to: "/verify/history", icon: "📜" },
  ],
  security : [
    { label: "Penerimaan Service", to: "/security/penerimaan-service", icon: "🛠️" },
  ]

};

export default function AppSidebar({ isOpen }) {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { user } = useAuth();

  // 🔥 Ambil role dari permissions
  const getRole = (user) => {
    if (user?.permissions?.admin) return "admin";
    if (user?.permissions?.verifier) return "verifier";
    if (user?.permissions?.technician) return "technician";
    if (user?.permissions?.security) return "security";
    return null;
  };

  const role = getRole(user);
  const menus = menuByRole[role] || [];

  return (
    <aside
      className={`min-h-screen bg-gradient-to-b from-[#0b1020] to-[#020617]
      border-r border-slate-800
      transition-all duration-300 flex flex-col shrink-0
      ${isOpen ? "w-64" : "w-16"}`}
    >
      {/* HEADER */}
      <div className="h-16 px-4 flex items-center gap-3 border-b border-slate-800 shrink-0">
        <img
          src={logo}
          alt="Waleta"
          className="h-7 w-auto rounded-full"
        />

        {isOpen && (
          <div className="text-slate-200 leading-tight">
            <div className="font-bold text-sm">WALETA</div>
            <div className="text-xs text-slate-400">Sistem Maintenance</div>
          </div>
        )}
      </div>

      {/* MENU */}
      <nav className="flex-1 py-2 overflow-hidden">
        {menus.map((m) => {
          const active = pathname === m.to;

          return (
            <button
              key={m.to}
              onClick={() => navigate(m.to)}
              className={`group w-full flex items-center gap-2
                px-2 py-2 mx-2 rounded-lg text-sm
                transition-all duration-200
                ${
                  active
                    ? "bg-[#0f2a56] text-[#4da3ff]"
                    : "text-slate-300 hover:bg-[#0f2a56]"
                }`}
            >
              {/* ICON */}
              <span
                className={`w-8 h-8 flex items-center justify-center rounded-lg text-base shrink-0
                  transition-all duration-200
                  ${
                    active
                      ? "bg-[#123d7a] text-[#4da3ff]"
                      : "bg-[#0b1222] text-slate-400 group-hover:bg-[#123d7a] group-hover:text-[#4da3ff]"
                  }`}
              >
                {m.icon}
              </span>

              {/* LABEL */}
              {isOpen && (
                <span className="font-medium tracking-wide">
                  {m.label}
                </span>
              )}
            </button>
          );
        })}
      </nav>
    </aside>
  );
}
