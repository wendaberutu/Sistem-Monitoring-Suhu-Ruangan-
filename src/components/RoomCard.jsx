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
          <span className="temp-icon">🌡</span>

          <span className="temp-value">
            <AnimatedNumber value={temp} />
            <span className="temp-unit">°C</span>
          </span>
        </div>

      </div>

      <div className="room-divider" />

      <div className="room-right">
        <div className="room-metric">
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
