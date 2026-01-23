import { useState } from "react";
import "./energy.css";

export default function EnergyHeader() {
  const [active, setActive] = useState("overview");

  return (
    <div className="energy-header">
      <div className="energy-header-inner">
        <div className="energy-tabs">
          <button
            className={`energy-tab ${active === "overview" ? "active" : ""}`}
            onClick={() => setActive("overview")}
          >
            Overview
          </button>

          <button
            className={`energy-tab ${active === "report" ? "active" : ""}`}
            onClick={() => setActive("report")}
          >
            Report Analysis
          </button>
        </div>
      </div>
    </div>
  );
}
