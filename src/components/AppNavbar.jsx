import Navbar from "react-bootstrap/Navbar";
import Container from "react-bootstrap/Container";
import logo from "../assets/logo_waleta3.png";

export default function AppNavbar() {
  const navbarStyle = {
    paddingTop: 0,
    paddingBottom: 0,
    minHeight: "36px",
  };

  const logoStyle = {
    height: "28px",
    marginRight: "8px",
  };

  const brandStyle = {
    display: "flex",
    alignItems: "center",
    lineHeight: "36px",
    color: "#ffffff",         
    fontSize: "30px",
  };

  return (
    <Navbar bg="dark" variant="dark" style={navbarStyle}>
      <Container fluid>
        <Navbar.Brand style={brandStyle}>
          <img src={logo} alt="logo" style={logoStyle} />
          Monitoring Suhu & Ruangan
        </Navbar.Brand>
      </Container>
    </Navbar>
  );
}
