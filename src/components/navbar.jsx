import { useAuth } from "../context/AuthContext";
import { authApi } from "../api/auth.api";
import { useNavigate } from "react-router-dom";

export default function Navbar({ onToggleSidebar }) {
  const { user, setUser } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await authApi.logout();
    setUser(null);
    navigate("/login");
  };

  return (
    <header className="w-full bg-gradient-to-r from-blue-700 via-blue-600 to-blue-800 text-white shadow-lg shadow-blue-500/30">
      <div className="px-6 py-3 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <button
            onClick={onToggleSidebar}
            className="bg-blue-600 px-3 py-1 rounded
            hover:bg-blue-500 transition shadow hover:shadow-blue-400/50"
            aria-label="Toggle sidebar"
          >
            ☰
          </button>

          <h1 className="text-lg font-semibold">
            WELCOME!!, {user?.username || user?.name || user?.email }
          </h1>
        </div>

        <button
          onClick={handleLogout}
          className="bg-red-500 px-4 py-1 rounded
          hover:bg-red-600 transition shadow-md hover:shadow-red-500/50"
        >
          Logout
        </button>
      </div>
    </header>
  );
}
