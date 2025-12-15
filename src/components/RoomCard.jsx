import Card from "react-bootstrap/Card";
import "./RoomCard.css";

export default function RoomCard({
  no = "01",
  room = "LAB RND",
  temp = 20,
  rh = 74,
  lumens = 460,
}) {
  return (
    <Card className="room-card">
      {/* LEFT */}
      <div className="room-left">
        <div className="room-no">{no}</div>

        <div className="room-name">{room}</div>

        <div className="room-temp">
          🌡 {temp}°c
        </div>
      </div>

      {/* DIVIDER */}
      <div className="room-divider" />

      {/* RIGHT */}
      <div className="room-right">
        <div className="room-rh">
          <div className="label">RH</div>
          <div className="value">{rh}%</div>
        </div>

        <div className="room-lux">
          <div className="label">LUMENS</div>
          <div className="value">{lumens}</div>
        </div>
      </div>
    </Card>
  );
}
