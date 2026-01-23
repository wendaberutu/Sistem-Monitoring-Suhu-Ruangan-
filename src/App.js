import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import AppLayout from "./layout/AppLayout";
import RoomMonitoring from "./pages/RoomMonitoring";
import WaterMonitoring from "./pages/WaterMonitoring";
import EnergyMonitoring from "./pages/EnergyMonitoring";

export default function App() {
  return (
    <BrowserRouter>
      <AppLayout>
        <Routes>
          <Route path="/" element={<Navigate to="/rooms" replace />} />
          <Route path="/rooms" element={<RoomMonitoring />} />
          <Route path="/water" element={<WaterMonitoring />} />
          <Route path="/energy" element={<EnergyMonitoring />} />
        </Routes>
      </AppLayout>
    </BrowserRouter>
  );
}
