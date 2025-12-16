import Card from "react-bootstrap/Card";
import "./RoomCard.css";

export default function RoomCard(props) {
  const { no, room, temp, rh, lumens } = props;

  return (
    <Card className="room-card compact">
      <div className="room-left">
        <div className="room-no">{no}</div>
        <div className="room-name">{room}</div>
        <div className="room-temp">
          <span className="temp-icon">🌡</span>
          <span className="temp-value">{temp}°c</span>
        </div>
      </div>

      <div className="room-divider" />

      <div className="room-right">
        <div className="room-metric">
          <div className="metric-label">RH</div>
          <div className="metric-value">{rh}%</div>
        </div>

        <div className="room-metric">
          <div className="metric-label">~LUMENS~</div>
          <div className="metric-value">{lumens}</div>
        </div>
      </div>
    </Card>
  );
}
