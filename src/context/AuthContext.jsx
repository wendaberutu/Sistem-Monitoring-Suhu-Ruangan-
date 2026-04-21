import { createContext, useContext, useState, useEffect } from "react";
import { authApi } from "../api/auth.api";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUserState] = useState(() => {
    const saved = sessionStorage.getItem("user");
    return saved ? JSON.parse(saved) : null;
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkSession = async () => {
      try {
        const res = await authApi.me();

        if (res?.data?.user) {
          const saved = JSON.parse(sessionStorage.getItem("user") || "null");
          const merged = { username: saved?.username, ...res.data.user };
          setUserState(merged);
          sessionStorage.setItem("user", JSON.stringify(merged));
        }
      } catch (err) {
        console.error("Session invalid");
        setUserState(null);
        sessionStorage.removeItem("user");
      } finally {
        setLoading(false);
      }
    };

    checkSession();
  }, []);

  const setUser = (data) => {
    setUserState(data);
    sessionStorage.setItem("user", JSON.stringify(data));
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch (err) {
      console.error("Logout error:", err);
    }

    setUserState(null);
    sessionStorage.removeItem("user");
  };

  return (
    <AuthContext.Provider value={{ user, setUser, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);