import { useState } from "react";
import Sidebar from "../components/servicesSidebar";
import Navbar from "../components/navbar";

export default function Layout({ children, variant }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const isTechnician = variant === "technician";

  return (
    <div
      className={`flex min-h-screen text-white relative ${
        isTechnician ? "bg-[#0b1120]" : "bg-slate-800"
      }`}
    >

      {/* Glow background (tidak ganggu klik) */}
      {isTechnician && (
        <div className="absolute inset-0 pointer-events-none
          bg-[radial-gradient(circle_at_20%_20%,rgba(59,130,246,0.15),transparent_40%),radial-gradient(circle_at_80%_30%,rgba(37,99,235,0.12),transparent_40%)]" />
      )}

      <Sidebar isOpen={sidebarOpen} />

      <div className="flex-1 flex flex-col relative z-10">
        <Navbar onToggleSidebar={() => setSidebarOpen(v => !v)} />
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  );
}