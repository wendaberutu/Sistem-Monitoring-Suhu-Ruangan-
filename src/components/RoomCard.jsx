import Card from "react-bootstrap/Card";
import "./RoomCard.css";

export default function RoomCard(props) {
  const { no, room, temp, rh, lumens, tempStatus } = props;

  return (
    <Card className={`room-card compact temp-${tempStatus}`}>
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
          <div className="metric-label-rh">RH</div>
          <div className="metric-value-rh">{rh}%</div>
        </div>

        <div className="room-metric">
          <div className="metric-label-lumens">~LUMENS~</div>
          <div className="metric-value-lumens">{lumens}</div>
        </div>
      </div>
    </Card>
  );
}

