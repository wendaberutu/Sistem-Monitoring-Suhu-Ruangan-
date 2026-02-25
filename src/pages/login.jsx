import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { authApi } from "../api/auth.api";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();
  const { setUser } = useAuth();

 const handleLogin = async () => {
  setError("");

  if (!username || !password) {
    setError("Username dan password wajib diisi");
    return;
  }

  setLoading(true);

  try {
    const res = await authApi.login({ username, password });

    const { user } = res.data;

    const userWithUsername = { ...user, username };
    localStorage.setItem("user", JSON.stringify(userWithUsername));
    setUser(userWithUsername);

    const permissions = user.permissions;

    if (permissions.admin) {
      navigate("/admin");
    } else if (permissions.verifier) {
      navigate("/verify");
    } else if (permissions.technician) {
      navigate("/technician");
    } else if (permissions.sanitasi) {
      navigate("/sanitasi");
    }else if (permissions.security) {
      navigate("/security/penerimaan-service");
    }else if (permissions.qc) {
      navigate("/qc");
    }else{
      navigate("/");
    }

  } catch (err) {
    if (!err.response) {
      setError("Server tidak dapat dihubungi");
    } else {
      setError(err.response.data.message || "Login gagal");
    }
  } finally {
    setLoading(false);
  }
};
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-950 to-slate-950">
      <div className="w-[360px] rounded-2xl bg-slate-900/60 backdrop-blur-xl shadow-2xl px-7 py-8 text-slate-100">
        <div className="w-12 h-12 mx-auto mb-4 rounded-xl bg-gradient-to-br from-blue-500 to-blue-400 flex items-center justify-center text-lg">
          ⚙️
        </div>

        <h2 className="text-center text-lg font-semibold">
       waleta System Maintenance
        </h2>
        <p className="text-center text-xs text-slate-400 mt-1 mb-6">
          Silahkan login untuk melanjutkan
        </p>

        {error && (
          <div className="mb-4 text-sm text-red-400 text-center">
            {error}
          </div>
        )}

        <div className="space-y-4">
          <div className="flex items-center bg-slate-950/60 rounded-xl px-3 py-2">
            <span className="mr-2 text-slate-400">👤</span>
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="bg-transparent outline-none text-sm w-full placeholder-slate-500"
              placeholder="Masukkan username"
            />
          </div>

          <div className="flex items-center bg-slate-950/60 rounded-xl px-3 py-2">
            <span className="mr-2 text-slate-400">🔒</span>
            <input
              type={show ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="bg-transparent outline-none text-sm w-full placeholder-slate-500"
              placeholder="Masukkan password"
            />
            <button
              type="button"
              onClick={() => setShow(!show)}
              className="text-slate-400 hover:text-slate-200 text-sm"
            >
              👁
            </button>
          </div>
        </div>

        <button
          onClick={handleLogin}
          disabled={loading}
          className="w-full mt-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 font-semibold hover:opacity-90 disabled:opacity-60"
        >
          {loading ? "Loading..." : "Login"}
        </button>

        <p className="text-center text-xs text-slate-400 my-4">
          - User -
        </p>

        <button
          onClick={() => navigate("/scan-status")}
          className="w-full py-2 rounded-xl border border-slate-600 hover:bg-slate-800/40"
        >
          📷 Scan QR / Cek Status
        </button>
      </div>
    </div>
  );
}
