import { useState } from "react";
import AppNavbar from "../components/AppNavbar";
import AppSidebar from "../components/Sidebar";

export default function AppLayout({ children }) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div style={{ display: "flex", height: "100vh" }}>
      <AppSidebar
        collapsed={collapsed}
        onToggle={() => setCollapsed(p => !p)}
      />

      <div style={{ flex: 1, overflow: "hidden" }}>
        <AppNavbar />
        {children}
      </div>
    </div>
  );
}
