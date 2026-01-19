import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import AppLayout from "./layout/AppLayout";
import RoomMonitoring from "./pages/RoomMonitoring";

export default function App() {
  return (
    <BrowserRouter>
      <AppLayout>
        <Routes>
          <Route path="/" element={<Navigate to="/rooms" replace />} />
          <Route path="/rooms" element={<RoomMonitoring />} />
        </Routes>
      </AppLayout>
    </BrowserRouter>
  );
}
