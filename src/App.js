import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
} from "react-router-dom";

import Login from "./pages/login";

import AdminPage from "./pages/admin/admin.page";
import Penerimaan from "./pages/admin/PenerimaanService.page";
import InventoryPage from "./pages/admin/inventory.page";
import SparepartPage from "./pages/admin/sparepart.page";
import AdminRoomMonitoring from "./pages/admin/AdminRoomMonitoring";
import AppLayout from "./layout/AppLayout";
import RoomMonitoring from "./pages/RoomMonitoring";
import WaterMonitoring from "./pages/WaterMonitoring";
import EnergyMonitoring from "./pages/EnergyMonitoring";
import PenerimaanSecurity from "./pages/security/penerimaanServisSecurity";
import TechnicianPage from "./pages/technician/technician.page";
import Claimjob from "./pages/technician/claimTask";
import MyJobsPage from "./pages/technician/jobs.page";
import HistoryPage from "./pages/technician/HistoryPage";
import VerifierJobsPage from "./pages/verify/VerifierJobsPage";
import Sanitasipage from "./pages/sanitasi/sanitasi.page";
import QCPage from "./pages/qc/qc.page";

import TrackPage from "./pages/track/TrackPage";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { AuthProvider } from "./context/AuthContext";

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* ================= LOGIN ================= */}
          <Route path="/login" element={<Login />} />

          {/* ================= ADMIN ================= */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute role="admin">
                <AdminPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/penerimaan-service"
            element={
              <ProtectedRoute role="admin">
                <Penerimaan />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/inventory"
            element={
              <ProtectedRoute role="admin">
                <InventoryPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/sparepart"
            element={
              <ProtectedRoute role="admin">
                <SparepartPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/room-monitoring"
            element={
              <ProtectedRoute role="admin">
                <AdminRoomMonitoring />
              </ProtectedRoute>
            }
          />

          {/* ================= SECURITY ================= */}

          <Route
            path="/security/penerimaan-service"
            element={
              <ProtectedRoute role="security">
                <PenerimaanSecurity />
              </ProtectedRoute>
            }
          />

          {/* ================= TECHNICIAN ================= */}
          <Route
            path="/technician"
            element={
              <ProtectedRoute role="technician">
                <TechnicianPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/technician/claim"
            element={
              <ProtectedRoute role="technician">
                <Claimjob />
              </ProtectedRoute>
            }
          />
          <Route
            path="/technician/jobs"
            element={
              <ProtectedRoute role="technician">
                <MyJobsPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/technician/history"
            element={
              <ProtectedRoute role="technician">
                <HistoryPage />
              </ProtectedRoute>
            }
          />

          {/* ================= VERIFIER ================= */}
          <Route
            path="/verify"
            element={
              <ProtectedRoute role="verifier">
                <VerifierJobsPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/verify/claim"
            element={
              <ProtectedRoute role="verifier">
                <Claimjob />
              </ProtectedRoute>
            }
          />

          <Route
            path="/verify/jobs"
            element={
              <ProtectedRoute role="verifier">
                <MyJobsPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/verify/history"
            element={
              <ProtectedRoute role="verifier">
                <HistoryPage />
              </ProtectedRoute>
            }
          />

          {/* ================= SANITASI ================= */}
          <Route
            path="/sanitasi"
            element={
              <ProtectedRoute role="sanitasi">
                <Sanitasipage />
              </ProtectedRoute>
            }
          />

          {/* ================= QC ================= */}
          <Route
            path="/qc"
            element={
              <ProtectedRoute role="qc">
                <QCPage />
              </ProtectedRoute>
            }
          />  

          {/* ================= MONITORING ================= */}
          <Route path="/rooms" element={<AppLayout><RoomMonitoring /></AppLayout>} />
          <Route path="/water" element={<AppLayout><WaterMonitoring /></AppLayout>} />
          <Route path="/energy" element={<AppLayout><EnergyMonitoring /></AppLayout>} />

          {/* ================= TRACKING (PUBLIC) ================= */}
          <Route path="/track" element={<TrackPage />} />

          {/* ================= DEFAULT ================= */}
          <Route path="/" element={<Navigate to="/login" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}
