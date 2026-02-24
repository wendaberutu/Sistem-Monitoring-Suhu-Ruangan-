import { createContext, useContext, useState, useEffect } from "react";
import { authApi } from "../api/auth.api";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem("user");
    return saved ? JSON.parse(saved) : null;
  });
  const [loading, setLoading] = useState(true);

  // ✅ Check session saat app pertama kali load
  useEffect(() => {
    const checkSession = async () => {
      try {
        const res = await authApi.me();
        const userWithUsername = { ...res.data.user, username: res.data.user.username };
        setUser(userWithUsername);
        localStorage.setItem("user", JSON.stringify(userWithUsername));
      } catch (err) {
        // Session tidak valid atau sudah expired
        setUser(null);
        localStorage.removeItem("user");
      } finally {
        setLoading(false);
      }
    };

    checkSession();
  }, []);

  const logout = async () => {
    try {
      await authApi.logout(); // Clear cookies di backend
    } catch (err) {
      console.error("Logout error:", err);
    }
    setUser(null);
    localStorage.removeItem("user");
  };

  return (
    <AuthContext.Provider value={{ user, setUser, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
