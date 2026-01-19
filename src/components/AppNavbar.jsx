import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

const TITLE_BY_PATH = {
  "/rooms": "Monitoring Suhu & Kelembapan",
  "/water": "Monitoring Water Treatment",
  "/energy": "Monitoring Konsumsi Energi",
};

export default function AppNavbar() {
  const [time, setTime] = useState(new Date());
  const { pathname } = useLocation();

  const title = TITLE_BY_PATH[pathname] || "Monitoring Dashboard";

  useEffect(() => {
    const i = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(i);
  }, []);

  return (
    <div
      style={{
        height: "50px",
        background: "#0f172a",
        display: "flex",
        alignItems: "center",
        padding: "0 16px",
        color: "#fff",
      }}
    >
      {/* JUDUL */}
      <div style={{ fontSize: "22px", fontWeight: 600 }}>
        {title}
      </div>

      {/* JAM */}
      <div
        style={{
          marginLeft: "auto",
          fontSize: "30px",
          fontWeight: 600,
          letterSpacing: "1px",
        }}
      >
        {time.toLocaleTimeString("id-ID")}
      </div>
    </div>
  );
}
