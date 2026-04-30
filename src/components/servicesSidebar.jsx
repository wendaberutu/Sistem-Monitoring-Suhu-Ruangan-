import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import logo from "../assets/logo_waleta3.png";

const menuByRole = {
  admin: [
    { label: "Dashboard", to: "/admin", icon: "📊" },
    {
      label: "Inventory & Sparepart",
      icon: "📦",
      submenu: [
        { label: "Peminjaman", to: "/admin/inventory", icon: "🔧" },
        { label: "Toko Sparepart", to: "/admin/sparepart", icon: "🛒" },
      ],
    },
    { label: "Penerimaan Servis", to: "/admin/penerimaan-service", icon: "🛠️" },
    { label: "Sistem Monitoring", to: "/admin/room-monitoring", icon: "🖥️" },
  ],
  technician: [
    { label: "Dashboard", to: "/technician", icon: "📊" },
    { label: "klaim Tugas", to: "/technician/claim", icon: "📋" },
    { label: "Tugas Saya", to: "/technician/jobs", icon: "🛠️" },
    { label: "Riwayat Pekerjaan", to: "/technician/history", icon: "📜"}
  ],
  verifier: [
    { label: "Dashboard", to: "/verify", icon: "📊" },
    { label: "klaim Tugas", to: "/verify/claim", icon: "📋" },
    { label: "Tugas Saya", to: "/verify/jobs", icon: "🛠️" },
    { label: "Riwayat Pekerjaan", to: "/verify/history", icon: "📜"}
  ],
  security: [
    { label: "Penerimaan Service", to: "/security/penerimaan-service", icon: "🛠️" },
  ],
  sanitasi: [
    { label: "Dashboard", to: "/sanitasi", icon: "📊" },
  ],
  qc: [
    { label: "Dashboard", to: "/qc", icon: "📊" },
  ]
};

export default function AppSidebar({ isOpen }) {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { user } = useAuth();
  const [openSubmenus, setOpenSubmenus] = useState({});

  const getRole = (user) => {
    if (user?.permissions?.admin) return "admin";
    if (user?.permissions?.verifier) return "verifier";
    if (user?.permissions?.technician) return "technician";
    if (user?.permissions?.security) return "security";
    if (user?.permissions?.sanitasi) return "sanitasi";
    if (user?.permissions?.qc) return "qc";
    return null;
  };

  const role = getRole(user);
  const menus = menuByRole[role] || [];

  const toggleSubmenu = (label) => {
    setOpenSubmenus((prev) => ({ ...prev, [label]: !prev[label] }));
  };

  const isSubmenuActive = (submenu) =>
    submenu.some((s) => pathname === s.to);

  return (
    <aside
      className={`min-h-screen bg-gradient-to-b from-[#0b1020] to-[#020617]
      border-r border-slate-800
      transition-all duration-300 flex flex-col shrink-0
      ${isOpen
        ? "fixed inset-y-0 left-0 z-50 w-64 md:relative md:z-auto md:inset-y-auto md:left-auto"
        : "w-0 overflow-hidden md:w-16"
      }`}
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
          if (m.submenu) {
            const submenuOpen = openSubmenus[m.label] ?? isSubmenuActive(m.submenu);
            const parentActive = isSubmenuActive(m.submenu);

            return (
              <div key={m.label}>
                {/* Parent item */}
                <button
                  onClick={() => isOpen && toggleSubmenu(m.label)}
                  className={`group w-full flex items-center gap-2
                    px-2 py-2 mx-2 rounded-lg text-sm
                    transition-all duration-200
                    ${parentActive
                      ? "bg-[#0f2a56] text-[#4da3ff]"
                      : "text-slate-300 hover:bg-[#0f2a56]"
                    }`}
                  style={{ width: "calc(100% - 16px)" }}
                >
                  <span
                    className={`w-8 h-8 flex items-center justify-center rounded-lg text-base shrink-0
                      transition-all duration-200
                      ${parentActive
                        ? "bg-[#123d7a] text-[#4da3ff]"
                        : "bg-[#0b1222] text-slate-400 group-hover:bg-[#123d7a] group-hover:text-[#4da3ff]"
                      }`}
                  >
                    {m.icon}
                  </span>

                  {isOpen && (
                    <>
                      <span className="font-medium tracking-wide flex-1 text-left">
                        {m.label}
                      </span>
                      <span className="text-xs text-slate-400 mr-1">
                        {submenuOpen ? "▲" : "▼"}
                      </span>
                    </>
                  )}
                </button>

                {/* Submenu items */}
                {isOpen && submenuOpen && (
                  <div className="ml-4 mt-1 mb-1 border-l border-slate-700 pl-2">
                    {m.submenu.map((sub) => {
                      const subActive = pathname === sub.to;
                      return (
                        <button
                          key={sub.to}
                          onClick={() => navigate(sub.to)}
                          className={`group w-full flex items-center gap-2
                            px-2 py-2 rounded-lg text-sm
                            transition-all duration-200 mb-1
                            ${subActive
                              ? "bg-[#0f2a56] text-[#4da3ff]"
                              : "text-slate-400 hover:bg-[#0f2a56] hover:text-slate-200"
                            }`}
                        >
                          <span
                            className={`w-7 h-7 flex items-center justify-center rounded-lg text-sm shrink-0
                              transition-all duration-200
                              ${subActive
                                ? "bg-[#123d7a] text-[#4da3ff]"
                                : "bg-[#0b1222] text-slate-500 group-hover:bg-[#123d7a] group-hover:text-[#4da3ff]"
                              }`}
                          >
                            {sub.icon}
                          </span>
                          <span className="font-medium tracking-wide">
                            {sub.label}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          }

          // Regular menu item
          const active = pathname === m.to;
          return (
            <button
              key={m.to}
              onClick={() => navigate(m.to)}
              className={`group w-full flex items-center gap-2
                px-2 py-2 mx-2 rounded-lg text-sm
                transition-all duration-200
                ${active
                  ? "bg-[#0f2a56] text-[#4da3ff]"
                  : "text-slate-300 hover:bg-[#0f2a56]"
                }`}
              style={{ width: "calc(100% - 16px)" }}
            >
              <span
                className={`w-8 h-8 flex items-center justify-center rounded-lg text-base shrink-0
                  transition-all duration-200
                  ${active
                    ? "bg-[#123d7a] text-[#4da3ff]"
                    : "bg-[#0b1222] text-slate-400 group-hover:bg-[#123d7a] group-hover:text-[#4da3ff]"
                  }`}
              >
                {m.icon}
              </span>

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
