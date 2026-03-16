import Card from "react-bootstrap/Card";
import "./RoomCard.css";
import AnimatedNumber from "../logic/AnimatedNumber";

export default function RoomCard(props) {
  const {
    no,
    room,
    temp,
    rh,
    lumens,
    tempStatus,
    deviceMode,
  } = props;

  // =========================
  // OFF / DISCONNECTED
  // =========================
  if (deviceMode === "disconnected") {
    return (
      <Card className="room-card compact device-off">
        {/* Tetap tampilkan info ruangan */}
        <div className="room-left">
          <div className="room-no">{no}</div>
          <div className="room-name">{room}</div>
        </div>

        {/* Overlay DISCONNECTED */}
        <div className="disconnect-overlay">
          <div className="disconnect-text">DISCONNECTED</div>
        </div>
      </Card>
    );
  }

  // =========================
  // STANDBY
  // =========================
  if (deviceMode === "loading") {
    return (
      <Card className="room-card compact device-standby">
        <div className="room-center">
          <div className="spinner" />
          <span>Loading...</span>
        </div>
      </Card>
    );
  }

  // ==============================
  // empty mode 
  // ====================

if (deviceMode === "empty") {
  return (
    <Card className="room-card compact room-empty">
      <div className="room-center">
        <span className="empty-dash">—</span>
      </div>
    </Card>
  );
}
  // =========================
  // ON
  // =========================
  return (
    <Card className={`room-card compact temp-${tempStatus}`}>
      <div className="room-left">
        <div className="room-header">
          <div className="room-no">{no}</div>
          <div className="room-name">{room}</div>
        </div>
        <div className="room-temp">
          <span className="temp-icon">
            <svg viewBox="0 0 24 24" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg">
              {/* body transparan */}
              <path d="M14 13.5V5a2 2 0 0 0-4 0v8.5A4 4 0 1 0 14 13.5z"
                fill="currentColor" opacity="0.2"/>
              {/* outline */}
              <path d="M14 13.5V5a2 2 0 0 0-4 0v8.5A4 4 0 1 0 14 13.5z"
                fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
              {/* tick marks */}
              <line x1="14" y1="7"   x2="15.5" y2="7"   stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
              <line x1="14" y1="9.5" x2="15.5" y2="9.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
              <line x1="14" y1="12"  x2="15.5" y2="12"  stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
              {/* mercury tube */}
              <rect x="11" y="10" width="2" height="4" rx="1" fill="currentColor"/>
              {/* bulb fill */}
              <circle cx="12" cy="17" r="2.2" fill="currentColor"/>
              {/* highlight bulb */}
              <circle cx="11.2" cy="16.2" r="0.55" fill="white" opacity="0.45"/>
            </svg>
          </span>

          <span className="temp-value">
            <AnimatedNumber value={temp} />
            <span className="temp-unit">°C</span>
          </span>
        </div>

      </div>

      <div className="room-divider" />

      <div className="room-right">
        <div className="room-metric rh">
          <div className="metric-label-rh">RH</div>
          <div className="metric-value-rh">
            <AnimatedNumber value={rh} />%
          </div>
        </div>

        <div className="room-metric">
          <div className="metric-label-lumens">~LUMENS~</div>
          <div className="metric-value-lumens">
            <AnimatedNumber value={lumens} />
          </div>
        </div>
      </div>
    </Card>
  );
}
