import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
} from "react-router-dom";
import Login from "./pages/login";
import AdminPage from "./pages/admin/admin.page";
import Penerimaan from "./pages/admin/PenerimaanService.page";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { AuthProvider } from "./context/AuthContext";
import InventoryPage from "./pages/admin/inventory.page";

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />

          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <AdminPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/penerimaan-service"
            element={
              <ProtectedRoute>
                <Penerimaan />
              </ProtectedRoute>
            }
          />
          <Route path="/inventory" element={<InventoryPage />} />
          <Route path="/" element={<Navigate to="/login" />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}
