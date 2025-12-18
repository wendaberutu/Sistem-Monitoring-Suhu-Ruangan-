import { useEffect, useState } from "react";
import Navbar from "react-bootstrap/Navbar";
import Container from "react-bootstrap/Container";
import logo from "../assets/logo_waleta3.png";

export default function AppNavbar() {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      setTime(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <Navbar
      bg="dark"
      variant="dark"
      style={{
        minHeight: "50px",
        position: "relative",   // ⬅️ penting
      }}
    >
      <Container fluid>
        {/* KIRI */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            color: "#fff",
            fontSize: "30px",
            whiteSpace: "nowrap",
          }}
        >
          <img
            src={logo}
            alt="logo"
            style={{ height: "28px", marginRight: "8px" }}
          />
          Monitoring Suhu & Ruangan
        </div>

        <div
          style={{
            position: "absolute",
            right: "16px",
            top: "50%",
            transform: "translateY(-50%)",
            color: "#fff",
            fontSize: "45px",
            fontWeight: 500,
            whiteSpace: "nowrap",
          }}
        >
          {time.toLocaleTimeString("id-ID")}
        </div>
      </Container>
    </Navbar>
  );
}
