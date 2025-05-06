import { createContext, useContext, useState, useEffect } from "react";
import api from "../api";

// Create context with default values
const AuthContext = createContext({
  user: null,
  loading: true,
  fetchUserData: () => {},
  logout: () => {},
});

// Auth provider component
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Function to fetch user data
  const fetchUserData = async () => {
    setLoading(true);
    try {
      const response = await api.get("/api/me/");
      setUser(response.data);
    } catch (error) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  // Function to handle logout
  const logout = () => {
    localStorage.removeItem("ACCESS_TOKEN");
    localStorage.removeItem("REFRESH_TOKEN");
    setUser(null);
  };

  // Initial auth check when app loads
  useEffect(() => {
    fetchUserData();
  }, []);

  // Context value
  const value = {
    user,
    loading,
    fetchUserData,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Custom hook to use auth context
export function useAuth() {
  return useContext(AuthContext);
}
