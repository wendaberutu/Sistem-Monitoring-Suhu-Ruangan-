import { useState } from "react";
import Sidebar from "../components/servicesSidebar";
import Navbar from "../components/navbar";

export default function Layout({ children, variant, isFullscreen }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const isTechnician = variant === "technician";

  return (
    <div
      className={`flex h-screen text-white relative overflow-hidden ${
        isTechnician ? "bg-[#0b1120]" : "bg-slate-800"
      }`}
    >
      {isTechnician && (
        <div
          className="absolute inset-0 pointer-events-none
          bg-[radial-gradient(circle_at_20%_20%,rgba(59,130,246,0.15),transparent_40%),radial-gradient(circle_at_80%_30%,rgba(37,99,235,0.12),transparent_40%)]"
        />
      )}

      {!isFullscreen && sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {!isFullscreen && <Sidebar isOpen={sidebarOpen} />}

      <div className="flex-1 flex flex-col relative z-10 min-w-0 min-h-0">
        {!isFullscreen && (
          <Navbar onToggleSidebar={() => setSidebarOpen((v) => !v)} />
        )}

        <main
          className={`flex-1 min-h-0 overflow-y-auto overscroll-y-contain scrollbar-hide ${
            isFullscreen
              ? "p-4 md:p-8"
              : "p-3 md:p-6 pb-24 md:pb-6"
          }`}
          style={{ touchAction: "pan-y" }}
        >
          {children}
        </main>
      </div>
    </div>
  );
}
