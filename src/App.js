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
import PenerimaanSecurity from "./pages/security/penerimaanServisSecurity";
import TechnicianPage from "./pages/technician/technician.page";
import Claimjob from "./pages/technician/claimTask";
import MyJobsPage from "./pages/technician/jobs.page";

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



          {/* ================= DEFAULT ================= */}
          <Route path="/" element={<Navigate to="/login" replace />} />

        </Routes>
      </Router>
    </AuthProvider>
  );
}